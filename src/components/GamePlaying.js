import React, { useState, useEffect } from 'react';
import { loader } from 'graphql.macro';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client';
import update from 'immutability-helper';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import ProgressBar from 'progressbar.js';

import Layout from './Layout';
import TileRow from './TileRow';
import PlayerDisplay from './PlayerDisplay';
import GameTable from './GameTable';
import Button from './Button';

import { c_HIGHLIGHT } from '../theme';

const GET_EVENTS = loader('../queries/GetEvents.graphql');
const SEND_EVENT = loader('../queries/SendEvent.graphql');
const LEAVE_GAME = loader('../queries/LeaveGame.graphql');

function GamePlaying(props) {
  const [offset, setOffset] = useState(-1);
  const [declaredTiles, setDeclaredTiles] = useState(
    (() => {
      const acc = [];
      for (let i = 0; i < props.gameData.game.nicknames.length; ++i) {
        acc.push([]);
      }
      return acc;
    })()
  );
  const [discardedTiles, setDiscardedTiles] = useState([]);
  const [myTiles, setMyTiles] = useState([]);
  const [turn, setTurn] = useState(0);
  const [east, setEast] = useState(0);
  const [heldTile, setHeldTile] = useState();
  const [waitingForDiscard, setWaitingForDiscard] = useState(false);
  const [progressBar, setProgressBar] = useState(null);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [validCombination, setValidCombination] = useState(false);
  const [animateEvents, setAnimateEvents] = useState(false);
  const [playerSpeech, setPlayerSpeech] = useState(
    Array(props.gameData.game.nicknames.length).fill(null)
  );
  const [speechTimeouts, setSpeechTimeouts] = useState(
    Array(props.gameData.game.nicknames.length).fill(null)
  );
  const [attemptedMahjong, setAttemptedMahjong] = useState(false);
  const [hasSentMahjong, setHasSentMahjong] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const refetchGame = () =>
    props.refetchGame({
      userHash: localStorage.getItem('userHash'),
      gameHash: props.hash,
    });

  useEffect(() => {
    setProgressBar(
      new ProgressBar.Line('#progressBar', {
        color: c_HIGHLIGHT,
        strokeWidth: 0.3,
        duration: 6000 /* TODO sync this with the server val somehow */,
      })
    );
  }, []);

  const playerSay = (player, text, time = 2000) => {
    if (!animateEvents) {
      return;
    }
    if (speechTimeouts[player]) {
      clearTimeout(speechTimeouts[player]);
    }
    setPlayerSpeech((prev) =>
      update(prev, {
        $splice: [[player, 1, text]],
      })
    );
    const timeout = setTimeout(() => {
      setPlayerSpeech((prev) =>
        update(prev, {
          $splice: [[player, 1, null]],
        })
      );
      setSpeechTimeouts((prev) =>
        update(prev, {
          $splice: [[player, 1, null]],
        })
      );
    }, time);
    setSpeechTimeouts((prev) =>
      update(prev, {
        $splice: [[player, 1, timeout]],
      })
    );
  };

  const myPos = () => props.gameData.game.myPosition;

  const isMyTurn = () => turn === myPos();

  const newTileId = (prevTiles) => {
    const prev = prevTiles[prevTiles.length - 1];
    return prev ? prev.id + 1 : 0;
  };

  const processEvent = (event) => {
    switch (event.type) {
      case 'START_TURN':
        setTurn(event.player);
        setWaitingForDiscard(true);
        setSelectedTiles([]);
        setValidCombination(false);
        setAttemptedMahjong(false);
        setHasSentMahjong(false);
        progressBar.set(0);
        break;
      case 'SET_EAST':
        setEast(event.player);
        break;
      case 'PICKUP_WALL':
        setMyTiles((prevMyTiles) =>
          update(prevMyTiles, {
            $push: [
              {
                suit: event.tile.suit,
                value: event.tile.value,
                id: newTileId(prevMyTiles),
              },
            ],
          })
        );
        break;
      case 'PICKUP_TABLE':
        /* We can assume that the last tile added to discards was the one picked up */
        setDiscardedTiles((prevDisc) =>
          update(prevDisc, {
            $splice: [[prevDisc.length - 1, 1]],
          })
        );
        if (event.player === myPos()) {
          setMyTiles((prevMyTiles) =>
            update(prevMyTiles, {
              $push: [
                {
                  suit: event.tile.suit,
                  value: event.tile.value,
                  id: newTileId(prevMyTiles),
                },
              ],
            })
          );
        }
        /* Can't pickup without declaring and discarding, so must be this player's turn */
        setTurn(event.player);
        break;
      case 'DISCARD':
        setDiscardedTiles((prevDisc) =>
          update(prevDisc, {
            $push: [
              {
                suit: event.tile.suit,
                value: event.tile.value,
              },
            ],
          })
        );
        if (event.player === myPos()) {
          setMyTiles((prevMyTiles) => {
            let ind = null;
            for (let i = 0; i < prevMyTiles.length; ++i) {
              if (
                prevMyTiles[i].suit === event.tile.suit &&
                prevMyTiles[i].value === event.tile.value
              ) {
                ind = i;
                break;
              }
            }
            if (ind === null) {
              /* This should never happen. */
              console.error(
                "Can't remove tile from my tiles when it was never there!"
              );
              return prevMyTiles;
            }
            return update(prevMyTiles, {
              $splice: [[ind, 1]],
            });
          });
        }
        setWaitingForDiscard(false);
        progressBar.animate(1);
        break;
      case 'DECLARE':
        const tiles = event.tileSet.tiles;
        setDeclaredTiles((prevDeclared) => {
          const newDeclared = update(prevDeclared[event.player], {
            $push: [tiles.map((tile) => ({ ...tile }))],
          });
          return update(prevDeclared, {
            $splice: [[event.player, 1, newDeclared]],
          });
        });
        if (event.player === myPos()) {
          setMyTiles((prevMyTiles) => {
            let toRemove = [];
            tiles.forEach((declaredTile) => {
              for (let i = 0; i < prevMyTiles.length; ++i) {
                if (
                  prevMyTiles[i].suit === declaredTile.suit &&
                  prevMyTiles[i].value === declaredTile.value
                ) {
                  if (!toRemove.includes(i)) {
                    toRemove.push(i);
                    break;
                  }
                }
              }
            });
            /* Reverse toRemove */
            toRemove.sort((a, b) => b - a);
            return update(prevMyTiles, {
              $splice: toRemove.map((ind) => [ind, 1]),
            });
          });
        }
        if (tiles[0].value === tiles[1].value) {
          if (tiles.length === 4) {
            playerSay(event.player, 'Kong!');
          } else {
            playerSay(event.player, 'Pung!');
          }
        } else {
          playerSay(event.player, 'Chow!');
        }
        break;
      case 'AUGMENT_DECLARED':
        setDeclaredTiles((prevDeclared) => {
          const decl = prevDeclared[event.player];
          for (let i = 0; i < decl.length; ++i) {
            if (
              !(
                event.tile.value === decl[i][0].value &&
                event.tile.suit === decl[i][0].suit &&
                event.tile.value === decl[i][1].value &&
                event.tile.suit === decl[i][1].suit
              )
            ) {
              continue;
            }

            const newDeclared = update(decl, {
              $push: [{ ...event.tile }],
            });
            return update(prevDeclared, {
              $splice: [[event.player, 1, newDeclared]],
            });
          }
        });

        if (event.player === myPos()) {
          setMyTiles((prevMyTiles) => {
            for (let i = prevMyTiles.length - 1; i > -1; --i) {
              if (
                !(
                  prevMyTiles[i].value === event.tile.value &&
                  prevMyTiles[i].suit === event.tile.suit
                )
              ) {
                continue;
              }

              return update(prevMyTiles, {
                $splice: [[i, 1]],
              });
            }
          });
        }
        playerSay(event.player, 'Kong!');
        break;
      case 'MAHJONG':
        playerSay(event.player, 'Mahjong!', 3000);
        setWinner(event.player);
        setTurn(event.player);
        break;
      case 'ROUND_END':
        setGameOver(true);
        progressBar.set(0);
        progressBar.animate(1, {
          duration: 10000,
        });
        setTimeout(refetchGame, 10000);
        break;
      default:
        break;
    }
  };

  const [
    actuallySendEvent,
    { /* loading: loadingSend, data: sendData, */ error: sendError },
  ] = useMutation(SEND_EVENT);

  useEffect(() => {
    if (sendError) {
      console.error('graphql:', sendError);
    }
  }, [sendError]);

  const sendEvent = (event) => {
    actuallySendEvent({
      variables: {
        userHash: localStorage.getItem('userHash'),
        gameHash: props.hash,
        event,
      },
    });
  };

  const discardHeld = () => {
    if (!heldTile) {
      return;
    }
    sendEvent({
      type: 'DISCARD',
      tile: {
        ...heldTile,
      },
    });
  };

  const onSelectTile = (tile) => {
    if (waitingForDiscard || isMyTurn()) {
      return;
    }

    setSelectedTiles((prevSelected) => {
      let ind;
      let alreadySelected = prevSelected.some((selTile, i) => {
        if (selTile.id === tile.id) {
          ind = i;
          return true;
        }
        return false;
      });
      if (alreadySelected) {
        if (selectedTiles.length === 3 || selectedTiles.length === 4) {
          setValidCombination(true);
        } else {
          setValidCombination(false);
        }
        return update(prevSelected, {
          $splice: [[ind, 1]],
        });
      } else {
        if (selectedTiles.length === 1 || selectedTiles.length === 2) {
          setValidCombination(true);
        } else {
          setValidCombination(false);
        }
        return update(prevSelected, {
          $push: [
            {
              ...tile,
            },
          ],
        });
      }
    });
  };

  const submitSelection = () => {
    const discard = discardedTiles[discardedTiles.length - 1];
    const tileSet = selectedTiles.map((tile) => ({
      suit: tile.suit,
      value: tile.value,
    }));
    tileSet.push(discard);

    sendEvent({
      type: 'PICKUP_TABLE',
      tile: discard,
      tileSet: {
        tiles: tileSet,
        concealed: false /* TODO */,
      },
    });
  };

  const submitMahjong = () => {
    if (attemptedMahjong) {
      sendEvent({
        type: 'MAHJONG',
      });
      setHasSentMahjong(true);
    } else {
      setAttemptedMahjong(true);
    }
  };

  const [doLeaveGame] = useMutation(LEAVE_GAME);

  const leaveGame = () => {
    doLeaveGame({
      variables: {
        userHash: localStorage.getItem('userHash'),
        gameHash: props.hash,
      },
    });
    refetchGame();
  };

  const { loading: loadingEvents, data: eventsData } = useQuery(GET_EVENTS, {
    variables: {
      userHash: localStorage.getItem('userHash'),
      gameHash: props.hash,
      offset,
    },
    pollInterval: 500, // TODO change
  });

  useEffect(() => {
    if (loadingEvents || !eventsData) {
      return;
    }

    if (!eventsData.events) {
      /* This shows that someone has probably left the game */
      refetchGame();
      return;
    }

    console.log('process');
    eventsData.events.events.forEach((ev) => {
      console.log(ev);
      processEvent(ev);
    });
    setOffset(() => {
      console.log('set offset');
      return eventsData.events.offset;
    });
    if (!animateEvents) {
      setAnimateEvents(true);
    }
    /* eslint-disable-next-line */
  }, [loadingEvents, eventsData]);

  const renderPlayers = () => {
    const players = [];
    let i = -1;
    while (true) {
      if (i >= props.gameData.game.nicknames.length) {
        i = 0;
      }
      if (i === east) {
        break;
      }
      if (i === -1) {
        i = east;
      }
      players.push(
        <PlayerDisplay
          key={i}
          nickname={
            props.gameData.game.nicknames[i] + (i === myPos() ? ' (you)' : '')
          }
          declared={declaredTiles[i]}
          hasCurrentTurn={i === turn}
          speech={playerSpeech[i]}
          isWinner={i === winner}
        />
      );
      i += 1;
    }

    return players;
  };

  const renderTileControls = () => {
    return (
      <>
        <TileRow
          tiles={myTiles}
          setHeld={setHeldTile}
          onSelectTile={onSelectTile}
          selectedTiles={selectedTiles}
          canSelectTile={!waitingForDiscard && !isMyTurn()}
        />
        <div className="buttons">
          <Button warning onClick={leaveGame}>
            Leave game
          </Button>
          <Button
            disabled={waitingForDiscard || isMyTurn() || !validCombination}
            onClick={submitSelection}
          >
            Make call
          </Button>
          <Button
            disabled={waitingForDiscard !== isMyTurn() || hasSentMahjong}
            onClick={submitMahjong}
            warning={attemptedMahjong}
          >
            {attemptedMahjong ? 'Confirm Mahjong' : 'Call Mahjong'}
          </Button>
        </div>
        <style jsx>{`
          .buttons {
            display: flex;
            justify-content: space-between;
          }

          .bold {
            font-weight: bold;
          }
        `}</style>
      </>
    );
  };

  const renderGameOver = () => {
    return (
      <div className="gameOver">
        The round has finished....
        <Button onClick={() => refetchGame()}>Next round</Button>
        <style jsx>{`
          .gameOver {
            font-size: 1.5rem;
          }
        `}</style>
      </div>
    );
  };

  const render = () => (
    <div className="playingArea">
      <div className="players">{renderPlayers()}</div>
      <GameTable
        tiles={discardedTiles}
        allowDiscard={isMyTurn() && waitingForDiscard}
        discardCallback={discardHeld}
        highlightLast={!waitingForDiscard && !isMyTurn()}
      />
      <div>
        <span className="bold">
          {eventsData ? eventsData.events.tilesRemaining : 'Some'}
        </span>{' '}
        tiles remaining
      </div>
      <div id="progressBar"></div>
      {gameOver ? renderGameOver() : renderTileControls()}
      <style jsx>{`
        .players {
          display: flex;
          justify-content: space-evenly;
        }

        .buttonsRow {
          display: flex;
          justify-content: space-evenly;
        }
      `}</style>
    </div>
  );

  return (
    <Layout center>
      <DndProvider backend={Backend}>{render()}</DndProvider>
    </Layout>
  );
}

GamePlaying.propTypes = {
  hash: PropTypes.string,
  gameData: PropTypes.object,
};

export default GamePlaying;

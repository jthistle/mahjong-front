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
  const [roundFinished, setRoundFinished] = useState(false);

  useEffect(() => {
    setProgressBar(
      new ProgressBar.Line('#progressBar', {
        color: c_HIGHLIGHT,
        strokeWidth: 0.3,
        duration: 5000 /* TODO sync this with the server val somehow */,
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
      case 'MAHJONG':
        playerSay(event.player, 'Mahjong!', 3000);
        setRoundFinished(true);
        break;
      default:
        break;
    }
  };

  const [
    actuallySendEvent,
    { loading: loadingSend, data: sendData, error: sendError },
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

  const { loading: loadingEvents, data: eventsData } = useQuery(GET_EVENTS, {
    variables: {
      userHash: localStorage.getItem('userHash'),
      gameHash: props.hash,
      offset,
    },
    pollInterval: 1000, // TODO change
  });

  useEffect(() => {
    if (loadingEvents || !eventsData) {
      return;
    }

    eventsData.events.events.forEach(processEvent);
    setOffset(eventsData.events.offset);
    if (!animateEvents) {
      setAnimateEvents(true);
    }
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
        />
      );
      i += 1;
    }

    return players;
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
      <div id="progressBar"></div>
      <TileRow
        tiles={myTiles}
        setHeld={setHeldTile}
        onSelectTile={onSelectTile}
        selectedTiles={selectedTiles}
        canSelectTile={!waitingForDiscard && !isMyTurn()}
      />
      <Button
        disabled={waitingForDiscard !== isMyTurn() || hasSentMahjong}
        onClick={submitMahjong}
      >
        {attemptedMahjong ? 'Confirm Mahjong' : 'Call Mahjong'}
      </Button>
      <Button
        disabled={waitingForDiscard || isMyTurn() || !validCombination}
        onClick={submitSelection}
      >
        Make call
      </Button>
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

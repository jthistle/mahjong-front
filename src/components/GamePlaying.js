import React, { useState, useEffect } from 'react';
import { loader } from 'graphql.macro';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client';
import update from 'immutability-helper';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';

import Layout from './Layout';
import TileRow from './TileRow';
import PlayerDisplay from './PlayerDisplay';
import GameTable from './GameTable';

import { c_BORDER_LIGHT, n_BORDER_RADIUS } from '../theme';

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
  const [heldTile, setHeldTile] = useState();
  const [waitingForDiscard, setWaitingForDiscard] = useState(false);

  const myPos = () => props.gameData.game.myPosition;

  const processEvent = (event) => {
    switch (event.type) {
      case 'START_TURN':
        setTurn(event.player);
        break;
      case 'PICKUP_WALL':
        setMyTiles((prevMyTiles) =>
          update(prevMyTiles, {
            $push: [
              {
                suit: event.tile.suit,
                value: event.tile.value,
              },
            ],
          })
        );
        setWaitingForDiscard(true);
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
                },
              ],
            })
          );
        }
        /* Can't pickup without declaring and discarding, so must be this player's turn */
        setTurn(event.player);
        setWaitingForDiscard(true);
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
        break;
      default:
        break;
    }
  };

  const [
    actuallySendEvent,
    { loading: loadingSend, data: sendData, error: sendError },
  ] = useMutation(SEND_EVENT);

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
    console.log('discarding:', heldTile);
    sendEvent({
      type: 'DISCARD',
      tile: {
        ...heldTile,
      },
    });
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
  }, [loadingEvents, eventsData]);

  const renderPlayers = () => {
    const players = [];
    let i = myPos() + 1;
    while (true) {
      if (i >= props.gameData.game.nicknames.length) {
        i = 0;
      }
      if (i === myPos()) {
        break;
      }
      players.push(
        <PlayerDisplay
          key={i}
          nickname={props.gameData.game.nicknames[i]}
          declaredTiles={declaredTiles[i]}
          hasCurrentTurn={i === turn}
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
        allowDiscard={turn === myPos() && waitingForDiscard}
        discardCallback={discardHeld}
      />
      <TileRow tiles={myTiles} setHeld={setHeldTile} />
      <style jsx>{`
        .players {
          display: flex;
          justify-content: space-between;
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

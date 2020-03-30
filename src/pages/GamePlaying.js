import React, { useState, useEffect } from 'react';
import { loader } from 'graphql.macro';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';
import update from 'immutability-helper';

import Layout from '../components/Layout';
import TileRow from '../components/TileRow';

import { c_BORDER_LIGHT, n_BORDER_RADIUS } from '../theme';

const GET_EVENTS = loader('../queries/GetEvents.graphql');

function GamePlaying(props) {
  const [offset, setOffset] = useState(-1);

  const [declaredTiles, setDeclaredTiles] = useState([]);
  const [discardedTiles, setDiscardedTiles] = useState([]);
  const [myTiles, setMyTiles] = useState([]);
  const [turn, setTurn] = useState(0);

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
        break;
      case 'PICKUP_TABLE':
        /* We can assume that the last tile added to discards was the one picked up */
        setDiscardedTiles((prevDisc) =>
          update(prevDisc, {
            $splice: [prevDisc.length - 1, 1],
          })
        );
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
        break;
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
  }, [loadingEvents, eventsData]);

  const render = () => (
    <div className="playingArea">
      <div className="mainTable"></div>
      <TileRow tiles={myTiles} />
    </div>
  );

  console.log(myTiles);

  return <Layout center>{render()}</Layout>;
}

GamePlaying.propTypes = {
  hash: PropTypes.string,
  gameData: PropTypes.object,
};

export default GamePlaying;

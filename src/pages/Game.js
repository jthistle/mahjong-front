import React, { useEffect } from 'react';
import { loader } from 'graphql.macro';
import { redirectTo } from '@reach/router';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';

import GameWaiting from '../components/GameWaiting';
import GamePlaying from '../components/GamePlaying';

const GET_GAME = loader('../queries/GetGame.graphql');

function Game(props) {
  useEffect(() => {
    if (!localStorage.getItem('userHash')) {
      redirectTo('/');
    }
  }, []);

  const {
    loading: loadingGame,
    data: gameData,
    error: gameError,
    refetch: refetchGame,
  } = useQuery(GET_GAME, {
    variables: {
      userHash: localStorage.getItem('userHash'),
      gameHash: props.hash,
    },
  });

  if (loadingGame || !gameData) {
    return <h1>Loading, please wait...</h1>;
  }

  if (gameError) {
    return (
      <>
        <h1>Oops, there was a problem</h1>
        <p>{gameError}</p>
      </>
    );
  }

  if (gameData.game.stage === 'PREGAME') {
    return (
      <GameWaiting
        hash={props.hash}
        gameData={gameData}
        refetchGame={refetchGame}
      />
    );
  } else if (gameData.game.stage === 'PLAY') {
    return <GamePlaying hash={props.hash} gameData={gameData} />;
  }
}

Game.propTypes = {
  /* game hash passed by router */
  hash: PropTypes.string,
};

export default Game;

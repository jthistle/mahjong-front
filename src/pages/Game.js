import React, { useEffect } from 'react';
import { redirectTo } from '@reach/router';
import { loader } from 'graphql.macro';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';

import Layout from '../components/Layout';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

const GET_GAME = loader('../queries/GetGame.graphql');

function Game(props) {
  useEffect(() => {
    if (!localStorage.getItem('userHash')) {
      redirectTo('/');
    }
  }, []);

  const { loading: loadingGame, data: gameData, error: gameError } = useQuery(
    GET_GAME,
    {
      variables: {
        userHash: localStorage.getItem('userHash'),
        gameHash: props.hash,
      },
    }
  );

  const render = () => {
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

    return (
      <>
        <h1>Waiting for players, join code: {gameData.game.joinCode}</h1>
      </>
    );
  };

  return <Layout center>{render()}</Layout>;
}

Game.propTypes = {
  /* game hash passed by router */
  hash: PropTypes.string,
};

export default Game;

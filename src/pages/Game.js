import React, { useState, useEffect } from 'react';
import { redirectTo } from '@reach/router';
import { loader } from 'graphql.macro';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';

import Layout from '../components/Layout';

import { c_BORDER_LIGHT, n_BORDER_RADIUS } from '../theme';

const GET_GAME = loader('../queries/GetGame.graphql');
const GET_USERS = loader('../queries/GetUsersInGame.graphql');

function Game(props) {
  const [nicknames, setNicknames] = useState([]);

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

  useEffect(() => {
    if (loadingGame || !gameData) return;

    setNicknames(gameData.game.nicknames);
  }, [loadingGame, gameData]);

  /* Keep the list of users updated */
  const { loading: loadingNicks, data: nicksData } = useQuery(GET_USERS, {
    variables: {
      userHash: localStorage.getItem('userHash'),
      gameHash: props.hash,
    },
    pollInterval: 1000,
  });

  useEffect(() => {
    console.log('in useeffect:', loadingNicks, nicksData);
    if (loadingNicks || !nicksData) return;

    setNicknames(nicksData.game.nicknames);
  }, [loadingNicks, nicksData]);

  const renderWaiting = () => {
    return (
      <>
        <h1>
          Hi,{' '}
          <span className="username">
            {nicknames[gameData.game.myPosition]}
          </span>
        </h1>
        <h2>Waiting for players...</h2>
        <h2>join using code:</h2>
        <div className="joinCode">{gameData.game.joinCode}</div>
        {nicknames.length === 1 ? (
          <p>No one else is here.</p>
        ) : (
          <>
            <p>Others here:</p>
            <div>
              {nicknames.map((name, i) => {
                if (i === gameData.game.myPosition) return;
                return (
                  <div className="otherName" key={i}>
                    {name}
                  </div>
                );
              })}
            </div>
          </>
        )}
        <style jsx>{`
          .username {
            font-style: italic;
          }

          .joinCode {
            font-size: 2.5rem;
            font-weight: bold;
            padding: 1rem;
            display: inline-block;
            border-radius: ${n_BORDER_RADIUS};
            border: 1px solid ${c_BORDER_LIGHT};
          }
        `}</style>
      </>
    );
  };

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

    if (gameData.game.stage === 'PREGAME') return renderWaiting();

    return <></>;
  };

  return <Layout center>{render()}</Layout>;
}

Game.propTypes = {
  /* game hash passed by router */
  hash: PropTypes.string,
};

export default Game;

import React, { useState, useEffect } from 'react';
import { loader } from 'graphql.macro';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client';

import Layout from './Layout';

import { c_BORDER_LIGHT, n_BORDER_RADIUS } from '../theme';

const GET_USERS = loader('../queries/GetUsersInGame.graphql');

function GameWaiting(props) {
  const [nicknames, setNicknames] = useState([]);

  useEffect(() => {
    if (!props.gameData) return;
    setNicknames(props.gameData.game.nicknames);
  }, [props.gameData]);

  /* Keep the list of users updated */
  const { loading: loadingNicks, data: nicksData } = useQuery(GET_USERS, {
    variables: {
      userHash: localStorage.getItem('userHash'),
      gameHash: props.hash,
    },
    pollInterval: 1000,
  });

  useEffect(() => {
    if (loadingNicks || !nicksData) return;

    setNicknames(nicksData.game.nicknames);
    props.refetchGame({
      userHash: localStorage.getItem('userHash'),
      gameHash: props.hash,
    });
  }, [props, loadingNicks, nicksData]);

  const render = () => {
    return (
      <>
        <h1>
          Hi,{' '}
          <span className="username">
            {nicknames[props.gameData.game.myPosition]}
          </span>
        </h1>
        <h2>Waiting for players...</h2>
        <h2>join using code:</h2>
        <div className="joinCode">{props.gameData.game.joinCode}</div>
        {nicknames.length === 1 ? (
          <p>No one else is here.</p>
        ) : (
          <>
            <p>Others here:</p>
            <div>
              {nicknames.map((name, i) => {
                if (i === props.gameData.game.myPosition) return <></>;
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

  return <Layout center>{render()}</Layout>;
}

GameWaiting.propTypes = {
  hash: PropTypes.string,
  gameData: PropTypes.object,
  refetchGame: PropTypes.func,
};

export default GameWaiting;

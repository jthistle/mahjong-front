import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { redirectTo } from '@reach/router';
import { loader } from 'graphql.macro';

import Layout from '../components/Layout';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

const CREATE_GAME = loader('../queries/CreateGame.graphql');
const JOIN_GAME = loader('../queries/JoinGame.graphql');

function Lobby(props) {
  /* Error state: whether an incorrect code was entered or game can't be joined */
  const [inErrorState, setInErrorState] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('userHash')) {
      redirectTo('/');
    }
  }, []);

  const [gameCode, setGameCode] = useState();

  const gameCodeChanged = (event) => {
    setGameCode(event.target.value);
    setInErrorState(false);
  };

  const [
    createGame,
    { loading: loadingCreate, data: createData },
  ] = useMutation(CREATE_GAME);

  const newGame = () => {
    createGame({
      variables: {
        userHash: localStorage.getItem('userHash'),
      },
    });
  };

  useEffect(() => {
    if (loadingCreate || !createData) return;

    const hash = createData.createGame;
    if (hash) {
      redirectTo('/game/' + hash);
    }
  }, [loadingCreate, createData]);

  const [joinGame, { loading: loadingJoin, data: joinData }] = useMutation(
    JOIN_GAME
  );

  const join = () => {
    joinGame({
      variables: {
        userHash: localStorage.getItem('userHash'),
        gameCode,
      },
    });
  };

  useEffect(() => {
    if (loadingJoin || !joinData) return;

    const hash = joinData.joinGame;
    if (hash) {
      redirectTo('/game/' + hash);
    } else {
      setInErrorState(true);
    }
  }, [loadingJoin, joinData]);

  return (
    <Layout center>
      <h1>Lobby</h1>
      <Button onClick={newGame}>Start a new game</Button>
      <div className="joinSection">
        <p>OR</p>
        <TextInput
          callback={gameCodeChanged}
          placeholder="Enter game code"
          error={inErrorState}
        />
        <Button onClick={join}>Join game</Button>
      </div>
      <style jsx>{`
        .joinSection {
          margin-top: 2rem;
          display: block;
        }
      `}</style>
    </Layout>
  );
}

export default Lobby;

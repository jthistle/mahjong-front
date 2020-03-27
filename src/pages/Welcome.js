import React, { useState, useEffect } from 'react';
import { redirectTo } from '@reach/router';
import { useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';

import Layout from '../components/Layout';
import Button from '../components/Button';
import TextInput from '../components/TextInput';

const CREATE_USER = loader('../queries/CreateUser.graphql');

function Welcome(props) {
  const [nickname, setNickname] = useState('');

  const [
    createUser,
    { loading: loadingCreate, data: createData },
  ] = useMutation(CREATE_USER);

  /* Callback for clicking the big button */
  const joinGame = () => {
    if (nickname === '') return;

    createUser({
      variables: {
        nickname,
      },
    });
  };

  /* Redirect user back to lobby if they are signed in */
  useEffect(() => {
    const hash = localStorage.getItem('userHash');
    if (hash) {
      redirectTo('/lobby');
    }
  }, []);

  /* Store user hash once we've created a new user */
  useEffect(() => {
    if (loadingCreate || !createData) return;

    const hash = createData.createUser;
    if (hash) {
      localStorage.setItem('userHash', hash);
      redirectTo('/lobby');
    }
  }, [loadingCreate, createData]);

  return (
    <Layout center>
      <div className="nick">
        <TextInput
          callback={(e) => setNickname(e.target.value)}
          placeholder="Nickname"
        />
      </div>
      <Button onClick={joinGame}>Play some Mahjong!</Button>
      <style jsx>{`
        .nick {
          display: inline-block;
          margin: 1rem 1rem 0 0;
        }
      `}</style>
    </Layout>
  );
}

export default Welcome;

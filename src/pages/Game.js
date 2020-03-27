import React, { useState } from 'react';
import { redirectTo } from '@reach/router';
import { loader } from 'graphql.macro';

import Layout from '../components/Layout';
import TextInput from '../components/TextInput';
import Button from '../components/Button';

function Game(props) {
  return (
    <Layout center>
      <h1>game</h1>
    </Layout>
  );
}

export default Game;

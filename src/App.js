import React from 'react';
import { Router } from '@reach/router';

import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

import Welcome from './pages/Welcome';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Test from './pages/Test';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000/graphql', // TODO make work for prod
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Welcome default />
        <Lobby path="/lobby" />
        <Game path="/game/:hash" />
        <Test path="/foobar" />
      </Router>
    </ApolloProvider>
  );
}

export default App;

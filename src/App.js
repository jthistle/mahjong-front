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
      </Router>
    </ApolloProvider>
  );
}

export default App;

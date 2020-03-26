import React from 'react';
import { Router } from '@reach/router';

import {
  ApolloProvider,
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

import Welcome from './pages/Welcome';

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'https://localhost:4000/graphql', // TODO make work for prod
  }),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Welcome default />
      </Router>
    </ApolloProvider>
  );
}

export default App;

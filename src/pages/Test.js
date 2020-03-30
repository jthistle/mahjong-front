import React from 'react';

import Layout from '../components/Layout';
import TileRow from '../components/TileRow';

function Test(props) {
  const tiles = [
    {
      suit: 'BAMBOO',
      value: 3,
    },
    {
      suit: 'BAMBOO',
      value: 4,
    },
    {
      suit: 'CIRCLES',
      value: 9,
    },
    {
      suit: 'DRAGONS',
      value: 2,
    },
  ];

  return (
    <Layout center>
      <TileRow tiles={tiles} />
    </Layout>
  );
}

export default Test;

import React from 'react';

import Layout from '../components/Layout';
import Button from '../components/Button';

function Welcome(props) {
  return (
    <Layout center={'cheese'}>
      <Button>Play some Mahjong!</Button>
    </Layout>
  );
}

export default Welcome;

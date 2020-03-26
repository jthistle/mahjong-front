import React from 'react';
import PropTypes from 'prop-types';

import Header from './Header';

import { c_BACKGROUND, c_TEXT_LIGHT } from '../theme';

function Layout(props) {
  return (
    <div className="allContent">
      <div className="background"></div>
      <Header />
      <div className="mainContent">{props.children}</div>
      <style jsx>{`
        .background {
          position: absolute;
          width: 100vw;
          height: 100vh;
          background: ${c_BACKGROUND};
          z-index: -10;
        }

        .allContent {
          color: ${c_TEXT_LIGHT};
          width: 100vw;
          min-height: 100vh;
        }

        .mainContent {
          margin: 0 auto;
          width: 75%;
          height: 100%;
          text-align: ${props.center ? 'center' : 'left'};
        }

        @media only screen and (max-width: 600px) {
          .mainContent {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

Layout.propTypes = {
  // Whether to centre the layout
  center: PropTypes.bool,
};

export default Layout;

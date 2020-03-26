import React from 'react';

import { c_HEADER } from '../theme';

function Header(props) {
  return (
    <div className="header">
      <div className="left">Mahjong</div>

      <style jsx>{`
        .header {
          width: 100%;
          padding: 1rem 0;
          background: ${c_HEADER};
          display: flex;
        }

        .left {
          font-size: 2rem;
          padding: 0 2rem;
        }
      `}</style>
    </div>
  );
}

export default Header;

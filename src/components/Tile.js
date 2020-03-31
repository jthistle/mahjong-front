import React from 'react';
import blankTile from './blankTile.svg';

/**
 * Credit to react-dnd simple drag and drop example for the basis for this.
 * https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples-hooks/src/04-sortable/simple/index.tsx
 * MIT licensed.
 */

const Tile = ({ suit, value }) => {
  return (
    <div className="tile">
      <img src={blankTile} alt="Blank tile" />
      <div className="text">
        {value} <br />
        {suit.slice(0, 2)}
      </div>
      <style jsx>{`
        .tile {
          margin: 0.25rem;
          height: 3rem;
        }

        img {
          z-index: -1;
          height: 3rem;
        }

        .text {
          position: relative;
          top: -3rem;
          left: 0;
          color: black;
        }
      `}</style>
    </div>
  );
};

export default Tile;

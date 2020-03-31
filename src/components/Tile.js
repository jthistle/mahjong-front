import React from 'react';
import imageFromTile from '../imageFromTile';

/**
 * Credit to react-dnd simple drag and drop example for the basis for this.
 * https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples-hooks/src/04-sortable/simple/index.tsx
 * MIT licensed.
 */

const Tile = ({ suit, value }) => {
  return (
    <div className="tile">
      <img src={imageFromTile({ suit, value })} alt="Mahjong tile" />
      <style jsx>{`
        .tile {
          margin: 0.25rem;
          height: 3.5rem;
        }

        img {
          z-index: -1;
          height: 3.5rem;
        }
      `}</style>
    </div>
  );
};

export default Tile;

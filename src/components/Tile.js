import React from 'react';
import imageFromTile from '../imageFromTile';

const Tile = ({ suit, value, highlight }) => {
  return (
    <div className="tile">
      <img src={imageFromTile({ suit, value })} alt={suit + ' ' + value} />
      <style jsx>{`
        .tile {
          margin: 0.25rem;
          height: 3.5rem;
          transition: 0.1s opacity;
          opacity: ${highlight === undefined || highlight ? 1 : 0.6};
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

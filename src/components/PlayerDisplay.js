import React from 'react';
import PropTypes from 'prop-types';

import Tile from './Tile';

function PlayerDisplay(props) {
  return (
    <div className="player">
      <div className="tiles">
        {props.declared.map((tileSet) => (
          <div className="tileSet">
            {tileSet.map((tile) => (
              <Tile {...tile} />
            ))}
            <br />
          </div>
        ))}
      </div>
      <div className="nickname">{props.nickname}</div>
      <style jsx>{`
        .nickname {
          font-size: 1.5rem;
          font-weight: ${props.hasCurrentTurn ? 'bold' : 'normal'};
        }
        .tiles {
          display: flex;
          flex-direction: column;
        }
        .tileSet {
          margin: auto;
          display: flex;
          flex-direction: row;
        }
        .player {
          width: 10rem;
          min-height: 5rem;
          border: 1px solid red;
        }
      `}</style>
    </div>
  );
}

PlayerDisplay.propTypes = {
  nickname: PropTypes.string,
  // Array of declared tiles
  declared: PropTypes.array,
  hasCurrentTurn: PropTypes.bool,
};

export default PlayerDisplay;

import React from 'react';
import PropTypes from 'prop-types';

import Tile from './Tile';

function PlayerDisplay(props) {
  let i = 0;
  let j = 0;
  return (
    <div className="player">
      <div className="tiles">
        {props.declared.map((tileSet) => (
          <div className="tileSet" key={j++}>
            {tileSet.map((tile) => (
              <Tile {...tile} key={i++} />
            ))}
            <br />
          </div>
        ))}
      </div>
      <div className="nickname">{props.nickname}</div>
      <style jsx>{`
        .nickname {
          font-size: 1.2rem;
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
          min-height: 5rem;
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

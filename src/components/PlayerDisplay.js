import React from 'react';
import PropTypes from 'prop-types';

function PlayerDisplay(props) {
  return (
    <div className="player">
      <div className="nickname">{props.nickname}</div>
      <style jsx>{`
        .nickname {
          font-size: 1.5rem;
          font-weight: ${props.hasCurrentTurn ? 'bold' : 'normal'};
        }
        .player {
          width: 10rem;
          height: 5rem;
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

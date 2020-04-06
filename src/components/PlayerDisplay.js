import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Tile from './Tile';
import {
  c_HIGHLIGHT,
  n_BORDER_RADIUS,
  c_TEXT_DARK,
  c_TEXT_LIGHT,
} from '../theme';

function PlayerDisplay(props) {
  let i = 0;
  let j = 0;
  const [speech, setSpeech] = useState(null);
  useEffect(() => {
    if (props.speech !== null) {
      setSpeech(props.speech);
    }
  }, [props.speech]);
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
      <div className="nickname">
        {props.nickname} {props.isWinner && 'wins!'}
      </div>
      <div className="speech">{speech}</div>
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
          min-height: 0rem;
          position: relative; /* So that the speech bubble floats */
          flex-grow: 1;
          color: ${props.isWinner ? c_TEXT_DARK : c_TEXT_LIGHT};
          background: ${props.isWinner ? c_HIGHLIGHT : 'none'};
          border-radius: ${n_BORDER_RADIUS};
          transition: 0.2s all;
        }
        .speech {
          background-color: ${c_HIGHLIGHT};
          padding: 1rem;
          border-radius: ${n_BORDER_RADIUS};
          transition: 0.2s all;
          width: 60%;
          position: absolute;
          margin: auto;
          left: 0;
          right: 0;
          color: ${c_TEXT_DARK};
          opacity: ${props.speech === null ? 0 : 0.9};
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
  speech: PropTypes.string,
  isWinner: PropTypes.bool,
};

export default PlayerDisplay;

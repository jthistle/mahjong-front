import React from 'react';

import {
  c_CALL_TO_ACTION,
  c_READY_FOR_ACTION,
  c_IN_ACTION,
  c_TEXT_DARK,
} from '../theme';

function Button(props) {
  return (
    <div className="button" onClick={props.onClick}>
      {props.children}
      <style jsx>{`
        .button {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          transition: 0.1s all;
          background: ${c_CALL_TO_ACTION};
          cursor: pointer;
        }

        .button:hover {
          background: ${c_READY_FOR_ACTION};
          color: ${c_TEXT_DARK};
        }

        .button:active {
          background: ${c_IN_ACTION};
          color: ${c_TEXT_DARK};
        }
      `}</style>
    </div>
  );
}

export default Button;

import React from 'react';
import PropTypes from 'prop-types';

import {
  c_CALL_TO_ACTION,
  c_READY_FOR_ACTION,
  c_IN_ACTION,
  c_TEXT_DARK,
  n_BORDER_RADIUS,
} from '../theme';

function Button(props) {
  return (
    <div className="button" onClick={props.onClick}>
      {props.children}
      <style jsx>{`
        .button {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: ${n_BORDER_RADIUS};
          transition: 0.1s all;
          background: ${c_CALL_TO_ACTION};
          cursor: pointer;
          margin: 0.5rem 1rem;
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

Button.propTypes = {
  onClick: PropTypes.func,
};

export default Button;

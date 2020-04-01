import React from 'react';
import PropTypes from 'prop-types';

import {
  c_CALL_TO_ACTION,
  c_READY_FOR_ACTION,
  c_IN_ACTION,
  c_TEXT_DARK,
  n_BORDER_RADIUS,
  c_DISABLED,
  c_TEXT_DISABLED,
  c_TEXT_LIGHT,
} from '../theme';

function Button(props) {
  return (
    <button
      className="button"
      onClick={props.onClick}
      disabled={props.disabled}
    >
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
          border: none;
          font-family: inherit;
          font-size: 1rem;
          color: ${c_TEXT_LIGHT};
        }

        .button:hover {
          background: ${c_READY_FOR_ACTION};
          color: ${c_TEXT_DARK};
        }

        .button:active {
          background: ${c_IN_ACTION};
          color: ${c_TEXT_DARK};
        }

        .button:disabled {
          background: ${c_DISABLED};
          color: ${c_TEXT_DISABLED};
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}

Button.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;

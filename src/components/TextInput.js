import React from 'react';
import PropTypes from 'prop-types';

import {
  c_CALL_TO_ACTION,
  c_BORDER_DARK,
  n_BORDER_RADIUS,
  c_READY_FOR_ACTION,
  c_TEXT_DARK,
  c_ERROR,
} from '../theme';

function TextInput(props) {
  return (
    <>
      <input
        type="text"
        onChange={props.callback}
        placeholder={props.placeholder}
      />
      <style jsx>{`
        input {
          background: ${c_CALL_TO_ACTION};
          border: ${props.error ? 2 : 1}px solid
            ${props.error ? c_ERROR : c_BORDER_DARK};
          border-radius: ${n_BORDER_RADIUS};
          color: ${c_TEXT_DARK};
          font-size: 1rem;
          padding: 1rem;
          transition: all 0.1s;
          font-family: inherit;
        }

        input:focus {
          background: ${c_READY_FOR_ACTION};
        }
      `}</style>
    </>
  );
}

Text.propTypes = {
  callback: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
};

export default TextInput;

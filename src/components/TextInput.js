import React from 'react';
import PropTypes from 'prop-types';

import {
  c_CALL_TO_ACTION,
  c_DARK_BORDER,
  n_BORDER_RADIUS,
  c_READY_FOR_ACTION,
  c_TEXT_DARK,
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
          border: 1px solid ${c_DARK_BORDER};
          border-radius: ${n_BORDER_RADIUS};
          color: ${c_TEXT_DARK};
          font-size: 1rem;
          padding: 1rem;
          transition: all 0.3s;
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
};

export default TextInput;

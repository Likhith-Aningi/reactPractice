import React, { useCallback } from "react";
import PropTypes from "prop-types";

const CallbackComponent = (props) => {
  console.log(`call back ${props.name} component loaded`);
  return (
    <div>
      Passed props : {props.someStr} {props.useMem && "returning memoised"}
      <br />
      <button onClick={() => props.someFunc()}>Child counter </button>
    </div>
  );
};

CallbackComponent.propTypes = {
  name: PropTypes.string,
  someStr: PropTypes.string,
  someFunc: PropTypes.func,
};
export default React.memo(CallbackComponent);

import { useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
const MemoComponent = ({ useMem = false, largeArr }) => {
  const [count, setCount] = useState(0);
  const expensivOp = useCallback(() => {
    console.log("expensive op done");
    return largeArr.find((x) => x.isMine).index;
  }, [largeArr]);
  const myNum = useMem
    ? useMemo(() => expensivOp(), [expensivOp])
    : expensivOp();
  return (
    <div>
      <h3 style={{ backgroundColor: useMem ? "green" : "red" }}>
        MemoComponent useMemo {!useMem && "not"} used check console while
        incrementing
      </h3>
      <p>my num is {myNum}</p>
      <button onClick={() => setCount((p) => p + 1)}>Increment{count}</button>
    </div>
  );
};
MemoComponent.propTypes = {
  useMem: PropTypes.bool,
  largeArr: PropTypes.array,
};
export default MemoComponent;

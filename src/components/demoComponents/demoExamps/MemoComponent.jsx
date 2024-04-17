import React, { useState, useMemo } from "react";
import { largeArr } from "../../LocalData";
const MemoComponent = ({ useMem = false }) => {
  const expensivOp = () => {
    console.log('expensive op done')
    return largeArr.find((x) => x.isMine).index;
  };
  const [count, setCount] = useState(0);
  const myNum = useMem ? useMemo(() => expensivOp(), [largeArr]) : expensivOp();
  return (
    <div>
      <h3>MemoComponent useMemo {!useMem && "not"} used check console while incrementing</h3>
      <p>my num is {myNum}</p>
      <button onClick={() => setCount((p) => p + 1)}>Increment{count}</button>
    </div>
  );
};

export default MemoComponent;

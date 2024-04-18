import React, { useMemo, useState } from "react";
const MemoComponent = ({ useMem = false ,largeArr}) => {
  const [count, setCount] = useState(0);
  const expensivOp = () => {
    console.log('expensive op done')
    return largeArr.find((x) => x.isMine).index;
  };
  const myNum = useMem ? useMemo(() => expensivOp(), [largeArr]) : expensivOp();
  return (
    <div>
      <h3 style={{backgroundColor:useMem?'green':'red'}}>MemoComponent useMemo {!useMem && "not"} used check console while incrementing</h3>
      <p>my num is {myNum}</p>
      <button onClick={() => setCount((p) => p + 1)}>Increment{count}</button>
    </div>
  );
};

export default MemoComponent;

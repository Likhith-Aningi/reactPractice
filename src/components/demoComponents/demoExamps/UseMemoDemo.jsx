import React from "react";
import MemoComponent from "./MemoComponent";
export const UseMemoDemo = () => {
  return (
    <div>
      <h3>UseMemoDemo</h3>
      <h4>Using Memo</h4>
      <div>
        <MemoComponent useMem={true} />
      </div>
      <h4>NotUsing Memo</h4>
      <div>
        <MemoComponent />
      </div>
    </div>
  );
};

import React, { useCallback } from "react";
import CallbackComponent from "./CallbackComponent";
const UseCallbackDemo = () => {
  const [str, setStr] = React.useState(0);
  const cbFunc = useCallback(() => {
    setStr((x) => x + 2);
  }, []);
  const justFunc = () => {
    setStr((x) => x + 3);
  };
  return (
    <div>
      UseCallbackDemo Count : {str}{" "}
      <input
        type="button"
        value="parent counter"
        onClick={() => setStr((c) => c + 1)}
      />
      <br />
      <CallbackComponent someStr="sending string only" someFunc={cbFunc} name="A" />
      <CallbackComponent
        someStr={"sending string only without using callback funciton"}
        someFunc={justFunc}
        name="B"
      />
    </div>
  );
};

export default UseCallbackDemo;

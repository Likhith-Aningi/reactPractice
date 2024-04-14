import React,{useState} from "react";

function Updater() {
  const [count, setCount] = useState(0);
  const incremOne = () => {
    setCount((prevCount) => prevCount + 1);
  };
  const incremTwo = () => {
    setCount((prevCount) => prevCount + 1);
    setCount((prevCount) => prevCount + 1);
  };
  const decremOne = () => {
    setCount((prevCount) => prevCount - 1);
  };
  const decremTwo = () => {
    setCount((prevCount) => prevCount - 1);
    setCount((prevCount) => prevCount - 1);
  };
  const reset=()=>setCount(0);
  return <div>
    <p>Count: {count}</p>
    <input type="button" value="-2" onClick={decremTwo}/>
    <input type="button" value="-1" onClick={decremOne}/>
    <input type="button" value="reset" onClick={reset}/>
    <input type="button" value="+1" onClick={incremOne}/>
    <input type="button" value="+2" onClick={incremTwo}/>
  </div>;
}

export default Updater;

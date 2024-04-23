import { useDispatch, useSelector } from "react-redux";
import {
  decrement,
  increment,
  incrementByAmount,
  reload,
} from "../../../redux/Counter/counterSlice";
function ReduxCounterDemo() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <div>
        <p> current counter value : {count}</p>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(incrementByAmount(10))}
        >
          Increment By 10
        </button>
        <button aria-label="Reset value" onClick={() => dispatch(reload())}>
          &#8635;
        </button>
      </div>
      <p>Note: count is hidden in header if it is 0</p>
    </div>
  );
}
export default ReduxCounterDemo;

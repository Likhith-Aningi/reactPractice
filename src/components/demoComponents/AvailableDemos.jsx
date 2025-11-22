import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UseMemoDemo } from "./demoExamps/UseMemoDemo";
import UseCallbackDemo from "./demoExamps/UseCallbackDemo";
import ReduxCounterDemo from "./demoExamps/ReduxCounterDemo";
import InfiniteLoadingWithReactWindowComponent from "./demoExamps/InfiniteLoadingWithReactWindow";
export const availableDemos = {
  useMemoDemo: <UseMemoDemo />,
  useCallbackDemo: <UseCallbackDemo />,
  reduxCounterDemo: <ReduxCounterDemo />,
  infiniteLoadingDemo: <InfiniteLoadingWithReactWindowComponent />,
};
function AvailableDemos() {
  const nav = useNavigate();
  const ref = useRef(null);
  const handleClick = (event) => {
    event.preventDefault();
    ref.current.style.display = "block";
    const to = event.currentTarget.getAttribute("href");
    console.log(ref.current.style.display);
    waitForLoader(ref.current, () => {
      nav(to);
    });
  };
  const waitForLoader = (element, callback) => {
    const intervalId = setInterval(() => {
      if (element.style.display === "block") {
        clearInterval(intervalId);
        callback();
      }
    }, 1);
  };

  return (
    <div>
      <h4>AvailableDemos</h4>
      <ol>
        <li>
          <Link to={`/demos/useMemoDemo`} onClick={(e) => handleClick(e)}>
            useMemo Demo
          </Link>
        </li>
        <li>
          <Link to={`/demos/useCallbackDemo`} onClick={(e) => handleClick(e)}>
            useCallback Demo
          </Link>
        </li>
        <li>
          <Link to={`/demos/reduxCounterDemo`} onClick={(e) => handleClick(e)}>
            Redux counter Demo
          </Link>
        </li>
        <li>
          <Link to={`/demos/infiniteLoadingDemo`} onClick={(e) => handleClick(e)}>
            Infinite scroller with react window
          </Link>
        </li>
        <li>
          <Link to={`/demos/useDemo`}>useDemo</Link>
        </li>
      </ol>
      <div className="loader" style={{ display: "none" }} ref={ref}></div>
    </div>
  );
}

export default AvailableDemos;

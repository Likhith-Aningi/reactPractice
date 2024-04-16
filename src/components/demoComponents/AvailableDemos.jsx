import React from "react";
import { Link } from "react-router-dom";
import { UseMemoDemo } from "./demoExamps/UseMemoDemo";
export const availableDemos = {
  useMemoDemo: <UseMemoDemo />,
};
function AvailableDemos() {
  return (
    <div>
      <h4>AvailableDemos</h4>
      <ol>
        <li>
          <Link to={`/demos/useMemoDemo`}>useMemo Demo</Link>
        </li>
        <li>
          <Link to={`/demos/useCallbackDemo`}>useCallback Demo</Link>
        </li>
      </ol>
    </div>
  );
}

export default AvailableDemos;

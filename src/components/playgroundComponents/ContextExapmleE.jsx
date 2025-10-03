import { useContext } from "react";
import { BoxContext } from "./ContextExapmleA";

function ContextExapmleD() {
  const context = useContext(BoxContext);
  return <div className="box">Box E access:{context.access}</div>;
}

export default ContextExapmleD;

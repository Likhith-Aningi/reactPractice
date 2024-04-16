import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { availableDemos } from "./AvailableDemos";

function Demo() {
  const { demo } = useParams();
  const nav = useNavigate();

  useEffect(() => {
    if (!availableDemos[demo]) {
      const timeoutId = setTimeout(() => nav("/demos"), 10000);// redirecting to /demos after 10 secs
      return () => clearTimeout(timeoutId);
    }
  }, [demo, nav]);

  if (!availableDemos[demo]) {
    return <h2>NO Component like that yet brother</h2>;
  }

  return (
    <div>
      <h3>Demo : {demo}</h3>
      {availableDemos[demo]}
    </div>
  );
}

export default Demo;

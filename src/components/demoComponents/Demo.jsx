import React, { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { availableDemos } from "./AvailableDemos";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeContext from "../ThemeContext";
function Demo() {
  const { demo } = useParams();
  const nav = useNavigate();
  const { theme } = useContext(ThemeContext);
  const timeOutRef = useRef(null);
  const notify = () =>
    toast.info("Going back to /demos in 10sec", {
      autoClose: 10000,
      pauseOnHover: false,
      theme: theme,
      position: "bottom-right",
      onClose: ()=>clearTimeout(timeOutRef.current),
    });
  useEffect(() => {
    if (!availableDemos[demo]) {
      notify();
      timeOutRef.current = setTimeout(() => {
        nav("/demos");
      }, 10000); // redirecting to /demos after 10 secs
      return () => clearTimeout(timeOutRef.current);
    }
  }, [demo, nav]);

  if (!availableDemos[demo]) {
    return (
      <div>
        <ToastContainer />
        <h2>NO Component like that yet brotha...</h2>
      </div>
    );
  }

  return (
    <div>
      <h3>Demo : {demo}</h3>
      {availableDemos[demo]}
    </div>
  );
}

export default Demo;

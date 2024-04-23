import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
function NotFound() {
  const nav = useNavigate();
  useEffect(() => {
    toast.warn("Navigating to / in 10 seconds");
    const timeOut = setTimeout(() => nav("/"), 10000);
    return () => {
      clearTimeout(timeOut);
    };
  });
  return (
    <div>
      <h1
        style={{
          display: "flex",
          height: "72vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Page Not found 404
      </h1>
      <ToastContainer autoClose={false} closeButton={false} />
    </div>
  );
}

export default NotFound;

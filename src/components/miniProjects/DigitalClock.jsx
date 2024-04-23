import { useEffect, useState } from "react";

function DigitalClock() {
  const [time, setTime] = useState(new Date());
  function formatTime() {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const meridiem = hours < 12 ? "AM" : "PM";
    return `${padZero(hours % 12 || 12)}:${padZero(minutes)}:${padZero(
      seconds
    )} ${meridiem}`;
  }
  function padZero(num) {
    return (num < 10 ? "0" : "") + num;
  }
  useEffect(() => {
    const timeUpdate = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => {
      //CLEAN UP WHEN COMPONENT IS DISMOUNTED OR RE-RENDERED
      clearInterval(timeUpdate);
    };
  });
  return (
    <div className="digital-clock-container">
      <h3>Digital Clock</h3>
      <div className="digital-clock">{formatTime()}</div>
    </div>
  );
}

export default DigitalClock;

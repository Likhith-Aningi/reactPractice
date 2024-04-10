import React, { useEffect, useRef, useState } from 'react'

function StopWatch() {
    const [isRunning, setIsRunning] = useState(false);
    const [timeTaken, setTimeTaken] = useState(0);
    const [flags, setFlags] = useState([]);
    const intervalId = useRef(null);
    const startTimeRef = useRef(0);
    function formatTime() {
        let hours = Math.floor(timeTaken / (1000 * 60 * 60));
        let minutes = Math.floor(timeTaken / (1000 * 60) % 60);
        let seconds = Math.floor(timeTaken / (1000) % 60);
        let millis = Math.floor((timeTaken % 1000));
        hours = String(hours).padStart(2, "0")
        minutes = String(minutes).padStart(2, "0");
        seconds = String(seconds).padStart(2, "0");
        millis = String(millis).padStart(3, "0");
        return `${hours}:${minutes}:${seconds}.${millis}`
    }
    useEffect(() => {
        if (isRunning) {
            intervalId.current = setInterval(() => {
                setTimeTaken(Date.now() - startTimeRef.current)
            }, 10);
        }
        return () => {
            //CLEAN UP WHEN COMPONENT IS DISMOUNTED OR RE-RENDERED
            clearInterval(intervalId.current);
        }
    }, [isRunning]);
    function start() {
        setIsRunning(true);
        startTimeRef.current = Date.now() - timeTaken;
    }
    function stop() {
        setIsRunning(false);
    }
    function reset() {
        setTimeTaken(0);
        setFlags([]);
        setIsRunning(false);
    }
    function flag() {
        if (!isRunning) return;
        setFlags(f => [...f, formatTime()])

    }
    return (
        <div>
            <h3>Stop watch</h3>
            <div className='digital-clock'>{formatTime()}</div>
            <div className="stop-watch-controls">
                <input type='button' value="Start" onClick={() => start()} disabled={isRunning} />
                <input type='button' value="Stop" onClick={() => stop()} disabled={!isRunning} />
                <input type='button' value="Reset" onClick={() => reset()} />
                <input type='button' value="Flag" onClick={() => flag()} disabled={!isRunning}/>
            </div>
            <div>
                <ul>
                    {flags.map((flag, index) => (
                        <li className="todo-task" key={index}>
                            <span className="todo-text">{flag}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default StopWatch
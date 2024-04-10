import React, { useState } from 'react'
import ColorPicker from './miniProjects/ColorPicker';
import TodoList from './miniProjects/TodoList';
import DigitalClock from './miniProjects/DigitalClock';
import StopWatch from './miniProjects/StopWatch';
function MiniProjects() {
    const [currentMiniProject, setCurrentMiniProject] = useState('colorPicker');
    const availableProjects = {
        colorPicker: <ColorPicker />,
        todoList: <TodoList />,
        digitalClock: <DigitalClock />,
        stopWatch: <StopWatch />
    }
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        }}>
            <select className='dropdownoptions' defaultValue={currentMiniProject} onChange={e => setCurrentMiniProject(e.target.value)}>
                <option value='colorPicker'>color picker</option>
                <option value='todoList'>Todo App</option>
                <option value='digitalClock'>Digital Clock</option>
                <option value='stopWatch'>Stop Watch</option>
            </select>
            <div style={{ padding: "40px" }}>
                {availableProjects[currentMiniProject]}
            </div>
        </div>
    )
}

export default MiniProjects
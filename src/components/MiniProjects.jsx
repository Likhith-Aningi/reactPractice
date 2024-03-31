import React, { useState } from 'react'
import ColorPicker from './ColorPicker';

function MiniProjects() {
    const [currentMiniProject,setCurrentMiniProject]=useState('colorPicker');
    const availableProjects={
        colorPicker:<ColorPicker />,
    }
  return (
    <div style={{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'column',
    }}>
        <select defaultValue={currentMiniProject} onChange={e=>setCurrentMiniProject(e.target.value)}>
            <option value='colorPicker'>color picker</option>
        </select>
        <div style={{padding:"40px"}}>
            {availableProjects[currentMiniProject]}
        </div>
    </div>
  )
}

export default MiniProjects
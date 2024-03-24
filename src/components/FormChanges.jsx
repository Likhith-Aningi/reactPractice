import React, { useState } from "react";
// text,textarea,select,,radio
function FormChanges() {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [select, setSelect] = useState("");
  const handleNameChange = (e) => {
    setName(e.target.value);
  };
  const handleTextChange = (e) => {
    setText(e.target.value);
  };
  const style={
    padding:'10px',
  }
  const [radio,setRadio]=useState('medium');
  return (
    <div style={style}>
      <h3>Form inputs </h3>
      <input type='text'value={name} onChange={(e) => handleNameChange(e)} />
      <p>Name is : {name}</p>
      <hr></hr>
      <textarea style={{minWidth:'100px',minHeight:'50px',maxWidth:'300px',maxHeight:'100px'}} value={text} onChange={(e) => handleTextChange(e)} />
      <p>address is : {text}</p>
      <hr></hr>
      <select name="select" id="" onChange={e=>setSelect(e.target.value)}>
        <option value="">Select an option</option>
        <option value="csk">csk</option>
        <option value="mi">mi</option>
      </select>
      <p>selected team: {select===''?'choose a team':select}</p>
      <hr></hr>
      <h3>Select Pizza Size</h3>

      <input onChange={e=>setRadio('regular')} type="radio" name="topping" value={radio} id="regular" />
      <label htmlFor="regular">Regular</label>

      <input type="radio" name="topping" value={radio} onChange={e=>setRadio('medium')} id="medium" />
      <label htmlFor="medium">Medium</label>

      <input type="radio" name="topping" value={radio} id="large" onChange={e=>setRadio('large')} />
      <label htmlFor="large">Large</label>
      <p>selected pizza size: {radio}</p>
    </div>
  );
}

export default FormChanges;

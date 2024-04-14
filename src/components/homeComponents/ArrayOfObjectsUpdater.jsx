import React, { useState } from "react";

function ArrayOfObjectsUpdater() {
  const [bikes, setBikes] = useState([]);
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  function handleYearChange(e) {
    setYear(e.target.value);
  }
  function handleNameChange(e) {
    setName(e.target.value);
  }
  function handleModelChange(e) {
    setModel(e.target.value);
  }
  function addToList() {
    setBikes((b) => [...b, { name, model, year }]);
    setName('');
    setModel('');
    setYear(new Date().getFullYear());
  }
  function removeBike(i) {
    setBikes((b) => b.filter((x, index) => index !== i));
  }
  return (
    <div>
      <h3>List of Bikes</h3>
      <input
        type="number"
        value={year}
        onChange={(e) => handleYearChange(e)}
        placeholder="enter year"
      />
      <br />
      <input
        type="text"
        value={model}
        onChange={(e) => handleModelChange(e)}
        placeholder="enter model"
      />
      <br />
      <input
        type="text"
        value={name}
        onChange={(e) => handleNameChange(e)}
        placeholder="enter name"
      />
      <br />
      <input type="button" value="Add to list" onClick={addToList} />
      <ul>
        {bikes.map((bike, index) => (
          <li key={index}>
            {bike.year} {bike.name} {bike.model}&nbsp;&nbsp;
            <input type="button" value="remove" onClick={()=>removeBike(index)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArrayOfObjectsUpdater;

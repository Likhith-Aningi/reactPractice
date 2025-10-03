import { useState } from "react";

function ObjectUpdater() {
  const [bike, setBike] = useState({
    name: "Harley Davidson",
    model: "X440",
    year: 2023,
  });
  function handleYearChange(e) {
    setBike((b) => ({ ...b, year: e.target.value }));
  }
  function handleNameChange(e) {
    setBike((b) => ({ ...b, name: e.target.value }));
  }
  function handleModelChange(e) {
    setBike((b) => ({ ...b, model: e.target.value }));
  }
  return (
    <div>
      <p>
        My Favourite bike is {bike.name} {bike.model} {bike.year}
      </p>
      <input
        type="text"
        value={bike.name}
        placeholder="Bike Name"
        onChange={handleNameChange}
      />
      <br />
      <input
        type="number"
        value={bike.year}
        placeholder="Year Introduced"
        onChange={handleYearChange}
      />
      <br />
      <input
        type="text"
        value={bike.model}
        placeholder="Bike Model"
        onChange={handleModelChange}
      />
    </div>
  );
}

export default ObjectUpdater;

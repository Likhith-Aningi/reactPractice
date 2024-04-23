import { useState } from "react";

function ArrayUpdater() {
  const [food, setFood] = useState(["sai", "annamayya"]);
  function handleAdd() {
    const newFoodInput = document.getElementById("japan");
    const newFoodValue = newFoodInput.value;
    setFood((prevFood) => [...prevFood, newFoodValue]);
    newFoodInput.value = "";
  }

  const clearFood = () => {
    setFood([]);
  };
  return (
    <div>
      <h3>List of foods</h3>
      <ul>
        {food.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
      <input type="text" id="japan" placeholder="enter food" />
      <br />
      &nbsp;&nbsp;
      <input value="add" type="button" onClick={() => handleAdd()} />
      &nbsp;&nbsp;
      <input value="clear" type="button" onClick={() => clearFood()} />
      <br />
    </div>
  );
}

export default ArrayUpdater;

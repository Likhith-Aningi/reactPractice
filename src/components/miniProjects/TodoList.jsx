import { useEffect, useRef, useState } from "react";

function TodoList() {
  // Initialize tasks from localStorage or default value
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("todoTasks");
    return savedTasks ? JSON.parse(savedTasks) : ["to do"];
  });
  const [task, setTask] = useState("");
  const inputArea = useRef(null);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Enter") {
        addTask();
      }
    }
    const input = inputArea.current;
    if (input) {
      input.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (input) {
        input.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [task]);

  function addTask() {
    if (task.trim() === "") {
      alert("enter task and add");
      inputArea.current.focus();
      return;
    }
    setTasks((p) => [...p, task]);
    setTask("");
  }

  function moveUp(index) {
    if (index === 0) return;
    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[index - 1];
    newTasks[index - 1] = temp;
    setTasks(newTasks);
  }

  function moveDown(index) {
    if (index === tasks.length - 1) return;
    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[index + 1];
    newTasks[index + 1] = temp;
    setTasks(newTasks);
  }

  function deleteTask(index) {
    setTasks(tasks.filter((_, i) => index !== i));
  }

  return (
    <div>
      <h3 style={{ textAlign: "center" }}>To Do App</h3>
      <span style={{ display: "flex", justifyContent: "center" }}>
        <input
          ref={inputArea}
          className="todo-input"
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter task"
        />
        <input
          type="button"
          value="➕"
          style={{
            backgroundColor: "#07f707",
            borderRadius: "50%",
            margin: "14px",
          }}
          onClick={() => addTask()}
          title="Add task"
        />
      </span>
      <ul style={{ padding: "0px" }}>
        {tasks.map((task, index) => (
          <li className="todo-task" key={index}>
            <span className="todo-text">{task}</span>
            <input
              type="button"
              onClick={() => moveUp(index)}
              value="👆"
              style={{
                backgroundColor: "rgb(39, 122, 211)",
                margin: "3px",
                borderRadius: "20px",
              }}
              title="Move up"
            />
            <input
              type="button"
              onClick={() => moveDown(index)}
              value="👇"
              style={{
                backgroundColor: "rgb(39, 122, 211)",
                margin: "3px",
                borderRadius: "20px",
              }}
              title="Move down"
            />
            <input
              type="button"
              onClick={() => deleteTask(index)}
              value="🗑️"
              style={{
                backgroundColor: "rgb(211, 39, 39)",
                margin: "3px",
                borderRadius: "20px",
              }}
              title="Delete task"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
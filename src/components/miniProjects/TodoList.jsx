import { useEffect, useRef, useState } from "react";

function TodoList() {
  // Initialize tasks from localStorage or default value
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("todoTasks");
    return savedTasks ? JSON.parse(savedTasks) : [{ text: "to do", status: "to do", lastUpdated: new Date().toISOString() }];
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
    setTasks((p) => [...p, { text: task, status: "to do", lastUpdated: new Date().toISOString() }]);
    setTask("");
  }

  function updateStatus(index, newStatus) {
    const newTasks = [...tasks];
    newTasks[index].status = newStatus;
    newTasks[index].lastUpdated = new Date().toISOString();
    setTasks(newTasks);
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

  function getStatusColor(status) {
    switch (status) {
      case "done":
        return "#3fbe46ff";
      case "doing":
        return "#1e63e2ff";
      case "to do":
        return "#6c757d";
      default:
        return "#6c757d";
    }
  }

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
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
          <li className="todo-task" key={index}  title={`Last updated: ${formatDateTime(task.lastUpdated)}`}>
            <span className="todo-text">{task.text}</span>
            <select
              value={task.status}
              onChange={(e) => updateStatus(index, e.target.value)}
              style={{
                backgroundColor: getStatusColor(task.status),
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "5px",
                margin: "3px",
                cursor: "pointer",
              }}
            >
              <option value="to do">To Do</option>
              <option value="doing">In Progress</option>
              <option value="done">Done</option>
            </select>
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
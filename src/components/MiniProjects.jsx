import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ColorPicker from "./miniProjects/ColorPicker";
import TodoList from "./miniProjects/TodoList";
import DigitalClock from "./miniProjects/DigitalClock";
import StopWatch from "./miniProjects/StopWatch";
import PasswordGenerator from "./miniProjects/PasswordGenerator";

function MiniProjects() {
  const { project } = useParams();
  const navigate = useNavigate();
  const [currentMiniProject, setCurrentMiniProject] = useState(project || "pwdGen");

  const availableProjects = {
    colorPicker: <ColorPicker />,
    todoList: <TodoList />,
    digitalClock: <DigitalClock />,
    stopWatch: <StopWatch />,
    pwdGen: <PasswordGenerator />,
  };

  useEffect(() => {
    if (project && availableProjects[project]) {
      setCurrentMiniProject(project);
    } else if (project) {
      navigate("/miniProjects/pwdGen", { replace: true });
    }
  }, [project]);

  const handleProjectChange = (e) => {
    const selectedProject = e.target.value;
    setCurrentMiniProject(selectedProject);
    navigate(`/miniProjects/${selectedProject}`);
  };

  return (
    <div className="dropdowncontainer">
      <select
        className="dropdownoptions"
        value={currentMiniProject}
        onChange={handleProjectChange}
      >
        <option value="colorPicker">color picker</option>
        <option value="todoList">Todo App</option>
        <option value="digitalClock">Digital Clock</option>
        <option value="stopWatch">Stop Watch</option>
        <option value="pwdGen">Random Password Generator</option>
      </select>
      <div style={{ padding: "40px" }}>
        {availableProjects[currentMiniProject]}
      </div>
    </div>
  );
}

export default MiniProjects;
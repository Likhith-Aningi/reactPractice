import { useContext } from "react";
import ThemeContext from "./ThemeContext";
import { NavLink } from "react-router-dom";
function Header() {
  const style = {
    display: "flex",
    whiteSpace: "no-wrap",
    listStyleType:"circle",
  };
  const liStyle = {
    marginLeft: "20px",
  };
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <>
      <h1 style={{ textAlign: 'center' }}>Welcome to my Learning Page</h1>
      <ul style={style}>
        <li><NavLink to="/">Home</NavLink></li>
        <li style={liStyle}><NavLink to="/about">About</NavLink></li>
        <li style={liStyle}><NavLink to="/miniProjects">MiniProjects</NavLink></li>
        <li style={{listStyleType:'none',marginRight:'20px',marginLeft:'auto'}}><label>
        <input
          type="checkbox"
          checked={theme === "dark"}
          onChange={(e) => {
            let chek = e.target.checked ? "dark" : "light";
            setTheme(chek);
            localStorage.setItem("theme", chek);
          }}
          />
          Need Dark?
      </label></li>
      </ul>
      <hr></hr>
    </>
  );
}
export default Header;

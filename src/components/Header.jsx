import { useContext } from "react";
import ThemeContext from "./ThemeContext";
import { flushSync } from "react-dom";
function Header() {
  const style = {
    display: "flex",
    // justifyContent:'space-evenly',
    whiteSpace: "no-wrap",
  };
  const liStyle = {
    marginLeft: "20px",
  };
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <>
      <h1>This is header</h1>
      <ul style={style}>
        <li>Home</li>
        <li style={liStyle}>About</li>
        <li style={liStyle}>Contact</li>
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

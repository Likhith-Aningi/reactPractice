import { useContext, useState } from "react";
import ThemeContext from "./ThemeContext";
import { NavLink } from "react-router-dom";
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  return (
    <>
      <h1 style={{ textAlign: "center" }}>Welcome to my Learning Page</h1>
      <span className="hamburger-menu" onClick={toggleMenu}>
        {showMenu ? "✕" : "☰"}
      </span>
      <ul className={`header ${showMenu ? "show-menu" : ""}`}>
        <li>
          <NavLink to="/" onClick={toggleMenu}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" onClick={toggleMenu}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/miniProjects" onClick={toggleMenu}>
            MiniProjects
          </NavLink>
        </li>
        <li
          style={{
            listStyleType: "none",
            marginRight: "20px",
            marginLeft: "auto",
          }}
        >
          <label>
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
          </label>
        </li>
      </ul>
      <hr></hr>
    </>
  );
}
export default Header;

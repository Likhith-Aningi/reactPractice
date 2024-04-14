import { useContext, useState } from "react";
import ThemeContext from "./ThemeContext";
import { NavLink } from "react-router-dom";
import Sun from "../assets/sun.svg";
import Moon from "../assets/moon.svg";
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  const handleThemeChange = (e) => {
    let chek = e.target.checked ? "dark" : "light";
    setTheme(chek);
    localStorage.setItem("theme", chek);
  };

  const sun = <img title="Toggle to Light Mode" src={Sun} />;
  const moon = <img title="Togle to Dark Mode" src={Moon} />;

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
              hidden={true}
              type="checkbox"
              checked={theme === "dark"}
              onChange={(e) => handleThemeChange(e)}
            />
            {theme === "dark" ? sun : moon}
          </label>
        </li>
      </ul>
      <hr />
    </>
  );
}
export default Header;

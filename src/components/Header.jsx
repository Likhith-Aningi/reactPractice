import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import Moon from "../assets/moon.svg";
import Sun from "../assets/sun.svg";
import ThemeContext from "./ThemeContext";
function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  const [showMenu, setShowMenu] = useState(false);
  const count = useSelector((state) => state.counter.value);

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
    <div className="header-wrapper">
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
          <NavLink to="/demos" onClick={toggleMenu}>
            Demos
          </NavLink>
        </li>
        <li>
          <NavLink to="/miniProjects" onClick={toggleMenu}>
            MiniProjects
          </NavLink>
        </li>
        <li>
          <NavLink to="/playground" onClick={toggleMenu}>
            Playground
          </NavLink>
        </li>
        <li
          style={{
            listStyleType: "none",
            marginLeft: "auto",
            marginRight: "20px",
          }}
        >
          {count !== 0 && <span>count is {count}</span>}
        </li>
        <li
          style={{
            listStyleType: "none",
            marginRight: "20px",
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
    </div>
  );
}
export default Header;

import "./App.css";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ThemeContext from "./components/ThemeContext.js";
import { useState } from "react";
import Home from "./components/Home.jsx";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Card from "./components/Card.jsx";
import MiniProjects from "./components/MiniProjects.jsx";
function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "dark");
  return (
    <div className={"app" + (theme === "dark" ? "-dark" : "")}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<Card name="likhith" desc="full-stack dev" age={23} />} />
            <Route path="/miniProjects" element={<MiniProjects />} />
            <Route
              path="*"
              element={
                <h1
                  style={{
                    display: "flex",
                    height: "72vh",
                    justifyContent: "center",
                    alignItems:"center"
                  }}
                >
                  Page Not found 404
                </h1>
              }
            />
          </Routes>
        </BrowserRouter>

        <Footer />
      </ThemeContext.Provider>
    </div>
  );
}

export default App;

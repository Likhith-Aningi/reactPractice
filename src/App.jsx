import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import MiniProjects from "./components/MiniProjects.jsx";
import NotFound from "./components/NotFound.jsx";
import Spacer from "./components/Spacer.jsx";
import ThemeContext from "./components/ThemeContext.js";
import Card from "./components/homeComponents/Card.jsx";
function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "dark");
  return (
    <div className={"app" + (theme === "dark" ? "-dark" : "")}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/about"
              element={<Card name="likhith" desc="full-stack dev" age={23} />}
            />
            <Route path="/miniProjects" element={<MiniProjects />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Spacer />
        <Footer />
      </ThemeContext.Provider>
    </div>
  );
}

export default App;

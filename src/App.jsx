import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import ThemeContext from "./components/ThemeContext.js";
// import Playground from "./components/Playground.jsx";
const Footer = lazy(() => import("./components/Footer.jsx"));
const Header = lazy(() => import("./components/Header.jsx"));
const Playground = lazy(() => import("./components/Playground.jsx"));
const MiniProjects = lazy(() => import("./components/MiniProjects.jsx"));
const NotFound = lazy(() => import("./components/NotFound.jsx"));
const Spacer = lazy(() => import("./components/Spacer.jsx"));
const AvailableDemos = lazy(() =>
  import("./components/demoComponents/AvailableDemos.jsx")
);
const Demo = lazy(() => import("./components/demoComponents/Demo.jsx"));
const Card = lazy(() => import("./components/playgroundComponents/Card.jsx"));

const Portfolio = () => {
  return (
    <iframe
      src="https://likhith-aningi.github.io/me/"
      title="External Portfolio"
      style={{
        width: "100%",
        height: "100vh",
        border: "none",
      }}
    />
  );
};

function App() {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ?? systemTheme
  );
  const calculateAge = (birthYear) => {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };
  return (
    <div className={`app${theme === "dark" ? "-dark" : ""}`}>
      <Suspense fallback={<div className="loader"></div>}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Portfolio />} />
              <Route
                path="/about"
                element={<Card name="Likhith" desc="full-stack dev" age={calculateAge(2002)} />}
              />
              <Route path="/demos" element={<Outlet />}>
                <Route index element={<AvailableDemos />} />
                <Route path=":demo" element={<Demo />} />
              </Route>
              <Route path="/miniProjects" element={<MiniProjects />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Spacer />
          <Footer />
        </ThemeContext.Provider>
      </Suspense>
    </div>
  );
}

export default App;
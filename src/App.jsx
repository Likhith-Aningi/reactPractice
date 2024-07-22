import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import "./App.css";
import ThemeContext from "./components/ThemeContext.js";
const Footer = lazy(() => import("./components/Footer.jsx"));
const Header = lazy(() => import("./components/Header.jsx"));
const Home = lazy(() => import("./components/Home.jsx"));
const MiniProjects = lazy(() => import("./components/MiniProjects.jsx"));
const NotFound = lazy(() => import("./components/NotFound.jsx"));
const Spacer = lazy(() => import("./components/Spacer.jsx"));
const AvailableDemos = lazy(() =>
  import("./components/demoComponents/AvailableDemos.jsx")
);
const Demo = lazy(() => import("./components/demoComponents/Demo.jsx"));
const Card = lazy(() => import("./components/homeComponents/Card.jsx"));

function App() {
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ?? systemTheme
  );

  return (
    <div className={`app${theme === "dark" ? "-dark" : ""}`}>
      <Suspense fallback={<div className="loader"></div>}>
        <ThemeContext.Provider value={{ theme, setTheme }}>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/about"
                element={<Card name="likhith" desc="full-stack dev" age={23} />}
              />
              <Route path="/demos" element={<Outlet />}>
                <Route index element={<AvailableDemos />} />
                <Route path=":demo" element={<Demo />} />
              </Route>
              <Route path="/miniProjects" element={<MiniProjects />} />
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

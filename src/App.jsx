import "./App.css";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Food from "./components/Food.jsx";
import Card from "./components/Card.jsx";
import Condition from "./components/ConditionlGreeting.jsx";
import GetData from "./components/GetData.jsx";
import FormChanges from "./components/FormChanges.jsx";
import ThemeContext from "./components/ThemeContext.js";
import { useState } from "react";
function App() {
  const [theme,setTheme]=useState(localStorage.getItem('theme')??'dark')
  return (
    <div className={"app"+(theme==='dark'?'-dark':'')}>
      <ThemeContext.Provider value={{theme,setTheme}}>
        <Header />
        <Food />
        <Food />
        <Food />
        <Card />
        <Card name="likhith" desc="full-stack dev" age={23} />
        <Card name="likhith" desc="cloud architect" age={27} />
        <Condition isAllowed={true} name="japan" />
        <Condition isAllowed={true} />
        <Condition />
        <GetData />
        <FormChanges />
        <Footer />
      </ThemeContext.Provider>
    </div>
  );
}

export default App;

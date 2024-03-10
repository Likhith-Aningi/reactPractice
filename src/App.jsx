import "./App.css";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Food from "./components/Food.jsx";
import Card from "./components/Card.jsx";
import Condition from "./components/ConditionlGreeting.jsx";
function App() {
  return (
    <div className="app">
      <Header />
      <Food />
      <Food />
      <Food />
      <Card />
      <Card name='likhith' desc='full-stack dev' age={23}/>
      <Card name='likhith' desc='cloud architect' age={27}/>
      <Condition isAllowed={true} name='japan'/>
      <Condition isAllowed={true} />
      <Condition />
      <Footer />
    </div>
  );
}

export default App;

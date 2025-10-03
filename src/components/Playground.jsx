import Food from "./playgroundComponents/Food.jsx";
import Card from "./playgroundComponents/Card.jsx";
import Condition from "./playgroundComponents/ConditionlGreeting.jsx";
import GetData from "./playgroundComponents/GetData.jsx";
import FormChanges from "./playgroundComponents/FormChanges.jsx";
import Updater from "./playgroundComponents/Updater.jsx";
import ArrayUpdater from "./playgroundComponents/ArrayUpdater.jsx";
import ObjectUpdater from "./playgroundComponents/ObjectUpdater.jsx";
import ArrayOfObjectsUpdater from "./playgroundComponents/ArrayOfObjectsUpdater.jsx";
import ContextExapmleA from "./playgroundComponents/ContextExapmleA.jsx";
function Playground() {
  return (
    <div>
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
      <Updater />
      <ArrayUpdater />
      <ObjectUpdater />
      <ArrayOfObjectsUpdater />
      <ContextExapmleA />
    </div>
  );
}

export default Playground;

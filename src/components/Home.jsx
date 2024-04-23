import Food from "./homeComponents/Food.jsx";
import Card from "./homeComponents/Card.jsx";
import Condition from "./homeComponents/ConditionlGreeting.jsx";
import GetData from "./homeComponents/GetData.jsx";
import FormChanges from "./homeComponents/FormChanges.jsx";
import Updater from "./homeComponents/Updater.jsx";
import ArrayUpdater from "./homeComponents/ArrayUpdater.jsx";
import ObjectUpdater from "./homeComponents/ObjectUpdater.jsx";
import ArrayOfObjectsUpdater from "./homeComponents/ArrayOfObjectsUpdater.jsx";
import ContextExapmleA from "./homeComponents/ContextExapmleA.jsx";
function Home() {
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

export default Home;

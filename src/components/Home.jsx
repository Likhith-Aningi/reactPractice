import React from 'react'
import Food from "./Food.jsx";
import Card from "./Card.jsx";
import Condition from "./ConditionlGreeting.jsx";
import GetData from "./GetData.jsx";
import FormChanges from "./FormChanges.jsx";
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
    </div>
  )
}

export default Home
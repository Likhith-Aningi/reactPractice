import PropTypes from 'prop-types'
const welcome={
    backgroundColor:"green",
    color:"white"
}
const prompt={
    color:"white",
    backgroundColor:"brown"
}
function ConditionlGreeting(props) {
    const allowed=<h3 style={welcome}>Hello {props.name} </h3>
    const propmted=<h3 style={prompt}>you are not allowed </h3>
  return (
    <div>
        {props.isAllowed?allowed:propmted}
    </div>
  )
}
ConditionlGreeting.propTypes={
    isAllowed:PropTypes.bool,
    name:PropTypes.string,
}
ConditionlGreeting.defaultProps={
    isAllowed:false,
    name:'Guest',
}
export default ConditionlGreeting
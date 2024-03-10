import Proptypes from 'prop-types'
function Card(props) {
  return (
    <div className='card'>
        <img alt="likhith dp" src="https://yt3.ggpht.com/yti/ANjgQV9TMFFnynxh79jyZ3UD0nW9-JznNKwwyaNRBRVU_As=s88-c-k-c0x00ffffff-no-rj"></img>
        <h2>{props.name}</h2>
        <p>{props.desc} </p>
        <p>{props.age} Years old </p>
    </div>
  )
}
Card.propTypes={
  name:Proptypes.string,
  desc:Proptypes.string,
  age:Proptypes.number,
}
Card.defaultProps={
  name:"Guest",
  desc:"Yet to be known",
  age:18,
}
export default Card
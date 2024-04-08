import React, { useContext } from 'react'
import ContextExapmleC from './ContextExapmleC'
import { BoxContext } from './ContextExapmleA';
function ContextExapmleB() {
  const context=useContext(BoxContext);
  return (
    <div className='box'>Box B name:{context.name}
    <ContextExapmleC/>
    </div>
  )
}

export default ContextExapmleB
import React, { useContext }  from 'react'
import { BoxContext } from './ContextExapmleA';
import ContextExapmleE from './ContextExapmleE';
function ContextExapmleD() {
  const context=useContext(BoxContext);
  context.access='user'
  return (
    <div className='box'>Box D access:{context.access}
      <ContextExapmleE/>
    </div>
  )
}

export default ContextExapmleD
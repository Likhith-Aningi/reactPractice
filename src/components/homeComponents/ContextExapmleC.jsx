import React, { useContext }  from 'react'
import { BoxContext } from './ContextExapmleA';

import ContextExapmleD from './ContextExapmleD'
function ContextExapmleC() {
  const context=useContext(BoxContext);
  return (
    <div className='box'>Box C rank: {context.rank} access:{context.access}
      <ContextExapmleD />
    </div>
  )
}

export default ContextExapmleC
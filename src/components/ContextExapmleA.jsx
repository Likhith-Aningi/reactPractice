import React, { createContext } from 'react'
import ContextExapmleB from './ContextExapmleB'
export const BoxContext = createContext(null);
function ContextExapmleA() {
    const bContext={
        name:'sai',
        access:'manager',
        rank:10,
    }
    return (
        <>
        <h3>Example for useContext rather than prop drilling</h3>
        <div className='box'>BoxA {JSON.stringify(bContext)}
            <BoxContext.Provider value={bContext}>
                <ContextExapmleB />
            </BoxContext.Provider>
        </div>
        </>
    )
}

export default ContextExapmleA
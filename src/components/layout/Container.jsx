import React from 'react'

const Container = ({children,bgColor}) => {
  return (
    <div style={{backgroundColor: bgColor}} className='p-4 m-3 rounded-md lg:min-h-screen md:min-h-screen min-h-screen w-[95%] mx-auto'>
        {children}
    </div>
  )
}

export default Container

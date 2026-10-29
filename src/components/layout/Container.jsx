/**
 * @file Container.jsx
 * @description Standard bounded layout container providing consistent horizontal padding, 95% centered width, and full viewport height.
 * @architecture Used to wrap page views and multi-column dashboards in a uniform width container.
 * @agent_note Enforces `w-[95%] mx-auto min-h-screen`. Accepts optional dynamic inline `bgColor`.
 */

import React from 'react'

/**
 * @component Container
 * @description Responsive content wrapper that bounds and centers page content with standard padding and margins.
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child elements rendered inside layout bounds
 * @param {string} [props.bgColor] - Optional background color string applied inline
 * @state None - Pure layout component
 */
const Container = ({children,bgColor}) => {
  return (
    <div style={{backgroundColor: bgColor}} className='p-4 m-3 rounded-md lg:min-h-screen md:min-h-screen min-h-screen w-[95%] mx-auto'>
        {children}
    </div>
  )
}

export default Container

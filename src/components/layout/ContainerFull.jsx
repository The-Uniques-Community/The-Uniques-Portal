/**
 * @file ContainerFull.jsx
 * @description Full-bleed viewport container with flexbox centering, customizable background color, and optional hero background image.
 * @architecture Used for full-screen authentication screens, splash pages, and 404 or standalone views.
 * @agent_note Applies `minHeight: '100vh'` and centered flex alignment (`justify-center items-center`). Supports `bgImg` cover image.
 */

import React from 'react';

/**
 * @component ContainerFull
 * @description Full-bleed centered layout wrapper used for standalone views, splash screens, and auth flows.
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Nested child content
 * @param {string} [props.bgColor='#fff'] - CSS background color fill
 * @param {string} [props.bgImg] - Optional background image URL applied with cover scaling
 * @state None - Pure layout component
 */
const ContainerFull = ({ children, bgColor = '#fff', bgImg }) => {
  return (
    <div
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImg ? `url(${bgImg})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
      className="rounded-md w-full mx-auto flex justify-center items-center p-4"
    >
      {children}
    </div>
  );
};

export default ContainerFull;

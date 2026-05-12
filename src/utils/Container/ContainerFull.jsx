import React from 'react';

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

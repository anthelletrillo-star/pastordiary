import React from 'react';

export const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div 
      className={`card ${className} ${onClick ? 'clickable' : ''}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      {...props}
    >
      {children}
    </div>
  );
};

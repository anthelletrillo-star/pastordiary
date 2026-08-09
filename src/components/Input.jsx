import React from 'react';
import './Input.css';

export const Input = ({ label, id, error, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className={`custom-input ${error ? 'error' : ''}`} {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export const Select = ({ label, id, error, children, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <select id={id} className={`custom-input ${error ? 'error' : ''}`} {...props}>
        {children}
      </select>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import './BottomSheet.css';

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow render before animation
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = '';
      }, 300); // match css transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div className={`bottom-sheet-overlay ${isVisible ? 'visible' : ''}`} onClick={onClose}>
      <div 
        className={`bottom-sheet-container ${isVisible ? 'visible' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="bottom-sheet-handle-wrap">
          <div className="bottom-sheet-handle"></div>
        </div>
        {title && <h3 className="bottom-sheet-title">{title}</h3>}
        <div className="bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  );
};

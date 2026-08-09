import React, { useState, useEffect } from 'react';
import './NotificationBanner.css';
import { X, Bell, MapPin, Clock } from 'lucide-react';

export const NotificationBanner = ({ appointment, onDismiss, onView }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (appointment) {
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 50);
    }
  }, [appointment]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for animation
  };

  if (!appointment) return null;

  return (
    <div className={`notification-banner ${isVisible ? 'visible' : ''}`}>
      <div className="notification-banner-content">
        <div className="notification-icon-wrap">
          <Bell size={20} color="white" />
        </div>
        <div className="notification-text">
          <div className="notification-label">Upcoming Appointment</div>
          <div className="notification-title">{appointment.title}</div>
          <div className="notification-meta">
            <span><Clock size={14} /> {appointment.time}</span>
            {appointment.location && (
              <span><MapPin size={14} /> {appointment.location}</span>
            )}
          </div>
        </div>
        <button className="notification-dismiss touch-target" onClick={handleDismiss}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { api } from '../services/api';

export const NotificationManager = ({ onNotification, onBadgeUpdate }) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Poll for upcoming appointments every 60 seconds
    const checkUpcoming = async () => {
      try {
        // Update badge count
        const { count } = await api.getTodayAppointmentCount();
        onBadgeUpdate(count);

        // Set PWA app badge
        if ('setAppBadge' in navigator && count > 0) {
          navigator.setAppBadge(count);
        } else if ('clearAppBadge' in navigator && count === 0) {
          navigator.clearAppBadge();
        }

        // Check for upcoming reminders
        const upcoming = await api.getUpcomingAppointments();
        
        for (const appt of upcoming) {
          // Fire browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification("Pastor's Diary - Reminder", {
              body: `📅 ${appt.title}\n⏰ ${appt.time}${appt.location ? `\n📍 ${appt.location}` : ''}`,
              icon: '/pwa-192x192.png',
              tag: appt.id, // Prevent duplicate notifications
              requireInteraction: true,
              vibrate: [200, 100, 200, 100, 200], // Vibration pattern
            });

            notification.onclick = () => {
              window.focus();
              notification.close();
            };
          }

          // Vibrate phone
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
          }

          // Show in-app banner
          onNotification(appt);

          // Mark as reminded so it doesn't fire again
          try {
            await api.markAppointmentReminded(appt.id);
          } catch (e) {
            console.error('Failed to mark reminded', e);
          }
        }
      } catch (err) {
        console.error('Notification check failed', err);
      }
    };

    // Check immediately on mount
    checkUpcoming();

    // Then check every 60 seconds
    intervalRef.current = setInterval(checkUpcoming, 60000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onNotification, onBadgeUpdate]);

  return null; // This component renders nothing
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select } from '../components/Input';
import { Card } from '../components/Card';
import { Clock, Plus, MapPin } from 'lucide-react';
import { api } from '../services/api';
import './CalendarPage.css';

export const CalendarPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [sermonsData, appointmentsData] = await Promise.all([
          api.getSermons(),
          api.getAppointments()
        ]);
        
        const mappedSermons = sermonsData.map(s => ({
          ...s,
          eventType: 'sermon',
          time: '10:00:00' // Default sermon time
        }));
        
        const mappedAppointments = appointmentsData.map(a => ({
          ...a,
          eventType: 'appointment'
        }));
        
        setEvents([...mappedSermons, ...mappedAppointments]);
      } catch (err) {
        console.error('Failed to load events', err);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Group events by date
  const groupedByDate = events.reduce((groups, event) => {
    const dateKey = event.date || 'No Date';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
    return groups;
  }, {});
  
  // Sort events within each day by time
  Object.keys(groupedByDate).forEach(key => {
    groupedByDate[key].sort((a, b) => {
      if (!a.time) return -1;
      if (!b.time) return 1;
      return a.time.localeCompare(b.time);
    });
  });

  const formatDate = (dateStr) => {
    if (dateStr === 'No Date') return dateStr;
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="page-content calendar-page">
      <div style={{marginBottom: '24px'}}>
        <Select defaultValue="agenda">
          <option value="agenda">Agenda View</option>
          <option value="week">Week View</option>
          <option value="month">Month View</option>
        </Select>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '40px'}}>Loading schedule...</div>
      ) : Object.keys(groupedByDate).length === 0 ? (
        <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '40px'}}>No scheduled events</div>
      ) : (
        Object.entries(groupedByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dateKey, dateEvents]) => (
            <div key={dateKey} className="agenda-group">
              <h3 className="agenda-date">{formatDate(dateKey)}</h3>
              {dateEvents.map(event => (
                <Card 
                  key={`${event.eventType}-${event.id}`} 
                  onClick={() => navigate(event.eventType === 'sermon' ? `/sermons/${event.id}` : `/calendar/appointment/${event.id}`)} 
                  className={`agenda-card ${event.eventType === 'appointment' ? 'agenda-card-appointment' : ''}`}
                >
                  <div className="agenda-title-row">
                    <div className="agenda-title">{event.title}</div>
                    {event.eventType === 'sermon' && <span className="sermon-badge">Sermon</span>}
                  </div>
                  {event.passage && <div className="agenda-passage">{event.passage}</div>}
                  {event.location && <div className="agenda-location"><MapPin size={14} style={{marginRight: '4px'}} /> {event.location}</div>}
                  <div className="agenda-time">
                    <Clock size={16} style={{marginRight: '4px'}} /> {formatTime(event.time)}
                  </div>
                </Card>
              ))}
            </div>
          ))
      )}
      
      <button className="fab" onClick={() => navigate('/calendar/appointment/new')}>
        <Plus size={24} />
      </button>
    </div>
  );
};

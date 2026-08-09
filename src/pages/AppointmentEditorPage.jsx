import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Save, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import './AppointmentEditorPage.css';

export const AppointmentEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      const fetchAppointment = async () => {
        try {
          const appt = await api.getAppointment(id);
          setTitle(appt.title || '');
          setDescription(appt.description || '');
          setDate(appt.date || '');
          setTime(appt.time ? appt.time.substring(0, 5) : ''); // format time for input
          setLocation(appt.location || '');
          setReminderMinutes(appt.reminder_minutes || 30);
        } catch (err) {
          console.error('Failed to load appointment', err);
        }
        setLoading(false);
      };
      fetchAppointment();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    if (!title || !date || !time) {
      alert("Title, Date, and Time are required.");
      return;
    }
    
    setSaving(true);
    try {
      const appointment = { 
        title, 
        description, 
        date, 
        time: time.length === 5 ? time + ':00' : time, // API expects HH:MM:SS
        location, 
        reminder_minutes: parseInt(reminderMinutes, 10),
        is_reminded: false // Reset reminder when updated
      };
      
      if (isNew) {
        await api.createAppointment(appointment);
      } else {
        await api.updateAppointment(id, appointment);
      }
      navigate('/calendar', { replace: true });
    } catch (err) {
      alert('Failed to save appointment: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await api.deleteAppointment(id);
      navigate('/calendar', { replace: true });
    } catch (err) {
      alert('Failed to delete appointment: ' + err.message);
    }
  };

  if (loading) {
    return <div className="page-content" style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>Loading appointment...</div>;
  }

  return (
    <div className="page-content appointment-editor">
      <Input label="Title" id="title" placeholder="e.g. Hospital Visit" value={title} onChange={e => setTitle(e.target.value)} required />
      
      <div className="date-time-row">
        <Input label="Date" id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <Input label="Time" id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
      </div>
      
      <Input label="Location" id="location" placeholder="e.g. Church Office" value={location} onChange={e => setLocation(e.target.value)} />
      
      <div className="input-group">
        <label className="input-label" htmlFor="description">Description</label>
        <textarea 
          id="description" 
          className="custom-input custom-textarea" 
          placeholder="Notes about this appointment..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <Select label="Reminder" id="reminder" value={reminderMinutes} onChange={e => setReminderMinutes(e.target.value)}>
        <option value={0}>At time of event</option>
        <option value={15}>15 minutes before</option>
        <option value={30}>30 minutes before</option>
        <option value={60}>1 hour before</option>
        <option value={1440}>1 day before</option>
      </Select>

      <div className="editor-actions">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Save size={20} style={{marginRight: '8px'}} /> {saving ? 'Saving...' : 'Save Appointment'}
        </Button>
        {!isNew && (
          <Button variant="text" onClick={handleDelete} style={{marginTop: '12px', color: 'var(--error-color)'}}>
            <Trash2 size={20} style={{marginRight: '8px'}} /> Delete Appointment
          </Button>
        )}
      </div>
    </div>
  );
};

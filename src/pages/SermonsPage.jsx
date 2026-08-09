import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, MoreVertical } from 'lucide-react';
import { api } from '../services/api';
import './SermonsPage.css';

export const SermonsPage = () => {
  const navigate = useNavigate();
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await api.getSermons();
        setSermons(data);
      } catch (err) {
        console.error('Failed to load sermons', err);
      }
      setLoading(false);
    };
    fetchSermons();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Scheduled': return { background: '#dbeafe', color: '#1d4ed8' };
      case 'Preached': return { background: '#dcfce7', color: '#15803d' };
      default: return { background: '#f1f5f9', color: '#64748b' };
    }
  };

  return (
    <div className="page-content sermons-page">
      <div className="sermons-header">
        <h2 className="sermons-title">My Sermons</h2>
        <Button 
          variant="primary" 
          onClick={() => navigate('/sermons/new')}
          style={{ width: 'auto' }}
        >
          <Plus size={20} style={{marginRight: '8px'}} /> New
        </Button>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '40px'}}>Loading sermons...</div>
      ) : sermons.length === 0 ? (
        <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '40px'}}>
          <p>No sermons yet.</p>
          <p>Tap "New" to create your first sermon!</p>
        </div>
      ) : (
        sermons.map(sermon => (
          <Card key={sermon.id} onClick={() => navigate(`/sermons/${sermon.id}`)} className="sermon-list-card">
            <div className="sermon-list-header">
              <span className="sermon-list-date">📅 {formatDate(sermon.date)}</span>
              <MoreVertical size={18} color="var(--text-secondary)" />
            </div>
            <div className="sermon-list-title">{sermon.title}</div>
            {sermon.passage && <div className="sermon-list-passage">📖 {sermon.passage}</div>}
            {sermon.series && <div className="sermon-list-series">📚 {sermon.series}</div>}
            <div className="sermon-list-footer">
              <span className="sermon-list-status" style={getStatusStyle(sermon.status)}>
                {sermon.status}
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

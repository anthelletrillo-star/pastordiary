import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Mic, BookOpen, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import './HomePage.css';

export const HomePage = () => {
  const navigate = useNavigate();
  const [upcomingSermon, setUpcomingSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const sermons = await api.getSermons();
        // Find the next upcoming sermon (scheduled, future date)
        const today = new Date().toISOString().split('T')[0];
        const upcoming = sermons.find(s => s.date >= today && s.status === 'Scheduled') || sermons[0];
        setUpcomingSermon(upcoming);
      } catch (err) {
        console.error('Failed to load upcoming sermon', err);
      }
      setLoading(false);
    };
    fetchUpcoming();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <div className="page-content home-page">
      <header className="home-header">
        <h2 className="greeting">Good morning, Pastor Jason</h2>
        <p className="subtitle">What would you like to do?</p>
      </header>
      
      <div className="quick-actions">
        <Card onClick={() => navigate('/sermons/new')} className="action-card">
          <div className="action-icon-wrap">
            <Mic size={24} color="var(--accent-primary)" />
          </div>
          <div className="action-text">
            <div className="card-title">Add Sermon</div>
            <div className="card-subtitle" style={{marginBottom: 0}}>Start writing a sermon</div>
          </div>
        </Card>
        
        <Card onClick={() => navigate('/bible')} className="action-card">
          <div className="action-icon-wrap">
            <BookOpen size={24} color="var(--accent-primary)" />
          </div>
          <div className="action-text">
            <div className="card-title">Open Bible</div>
            <div className="card-subtitle" style={{marginBottom: 0}}>Continue Bible reading</div>
          </div>
        </Card>
      </div>
      
      <section className="upcoming-section">
        <h3 className="section-title">Upcoming Sermon</h3>
        {loading ? (
          <div className="card" style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Loading...</div>
        ) : upcomingSermon ? (
          <Card onClick={() => navigate(`/sermons/${upcomingSermon.id}`)}>
            <div className="sermon-card-header">
              <span className="sermon-date">{formatDate(upcomingSermon.date)}</span>
              <span className="sermon-status">{upcomingSermon.status}</span>
            </div>
            <div className="sermon-title">{upcomingSermon.title}</div>
            <div className="sermon-passage">{upcomingSermon.passage}</div>
            <div className="sermon-action">
              <span>View Sermon</span>
              <ChevronRight size={16} />
            </div>
          </Card>
        ) : (
          <Card>
            <div className="card-subtitle" style={{textAlign: 'center'}}>No upcoming sermons yet</div>
          </Card>
        )}
      </section>
    </div>
  );
};

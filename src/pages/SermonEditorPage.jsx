import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { Save, Paperclip, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import './SermonEditorPage.css';

export const SermonEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [passage, setPassage] = useState('');
  const [series, setSeries] = useState('');
  const [status, setStatus] = useState('Draft');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isNew) {
      const fetchSermon = async () => {
        try {
          const sermon = await api.getSermon(id);
          setTitle(sermon.title || '');
          setDate(sermon.date || '');
          setPassage(sermon.passage || '');
          setSeries(sermon.series || '');
          setStatus(sermon.status || 'Draft');
          setContent(sermon.content || '');
        } catch (err) {
          console.error('Failed to load sermon', err);
        }
        setLoading(false);
      };
      fetchSermon();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const sermon = { title, date, passage, series, status, content };
      if (isNew) {
        const created = await api.createSermon(sermon);
        navigate(`/sermons/${created.id}`, { replace: true });
      } else {
        await api.updateSermon(id, sermon);
      }
      alert('Sermon saved!');
    } catch (err) {
      alert('Failed to save sermon: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this sermon?')) return;
    try {
      await api.deleteSermon(id);
      navigate('/sermons', { replace: true });
    } catch (err) {
      alert('Failed to delete sermon: ' + err.message);
    }
  };

  const handleUpload = () => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(0), 2000);
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'header': 1 }],
      [{ 'list': 'bullet'}, { 'list': 'ordered'}],
      ['blockquote', 'link'],
      ['clean']
    ]
  };

  if (loading) {
    return <div className="page-content" style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>Loading sermon...</div>;
  }

  return (
    <div className="page-content sermon-editor">
      <Input label="Sermon Title" id="title" placeholder="e.g. Walking by Faith" value={title} onChange={e => setTitle(e.target.value)} />
      <Input label="Date" id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input label="Bible Passage" id="passage" placeholder="e.g. 2 Corinthians 5:7" value={passage} onChange={e => setPassage(e.target.value)} />
      
      <Select label="Series" id="series" value={series} onChange={e => setSeries(e.target.value)}>
        <option value="">None</option>
        <option value="Faith Series">Faith Series</option>
        <option value="Grace Series">Grace Series</option>
        <option value="Gospel of John">Gospel of John</option>
      </Select>
      
      <Select label="Status" id="status" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="Draft">Draft</option>
        <option value="Scheduled">Scheduled</option>
        <option value="Preached">Preached</option>
      </Select>

      <div className="editor-container">
        <label className="input-label" htmlFor="sermon-content">Sermon Content</label>
        <textarea 
          id="sermon-content"
          className="custom-input custom-textarea" 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="Start writing your sermon here..."
          rows={12}
          style={{ width: '100%', minHeight: '200px', resize: 'vertical', fontFamily: 'inherit', fontSize: '1rem', lineHeight: '1.6' }}
        />
      </div>

      <div className="attachment-section">
        <Button variant="secondary" onClick={handleUpload}>
          <Paperclip size={20} style={{marginRight: '8px'}} /> Add Attachment
        </Button>
        <p className="attachment-hint">PDF, DOCX, PPTX, Audio</p>
        
        {uploadProgress > 0 && (
          <div className="upload-progress-container">
            <div className="upload-text">Uploading sermon-notes.pdf... {uploadProgress}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="editor-actions">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Save size={20} style={{marginRight: '8px'}} /> {saving ? 'Saving...' : 'Save Sermon'}
        </Button>
        {!isNew && (
          <Button variant="text" onClick={handleDelete} style={{marginTop: '12px', color: 'var(--error-color)'}}>
            <Trash2 size={20} style={{marginRight: '8px'}} /> Delete Sermon
          </Button>
        )}
      </div>
    </div>
  );
};

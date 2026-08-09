import React, { useState, useEffect } from 'react';
import { BookOpen, MoreVertical, Bookmark, MessageSquare, Copy, Link2, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import { BottomSheet } from '../components/BottomSheet';
import { Button } from '../components/Button';
import { Select } from '../components/Input';
import './BiblePage.css';

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 
  'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', 
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', 
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', 
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

export const BiblePage = () => {
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [translation, setTranslation] = useState('kjv');
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://bible-api.com/${book} ${chapter}?translation=${translation}`);
        const data = await response.json();
        setVerses(data.verses || []);
      } catch (err) {
        console.error("Error fetching Bible data", err);
      }
      setLoading(false);
    };
    
    fetchChapter();
  }, [book, chapter, translation]);

  const handleVerseClick = (verse) => {
    setSelectedVerse(verse);
  };

  return (
    <div className="page-content bible-page">
      <div className="bible-controls">
        <Select value={translation} onChange={e => setTranslation(e.target.value)}>
          <option value="kjv">KJV</option>
          <option value="web">WEB</option>
          <option value="bbe">BBE</option>
        </Select>
        <Select value={book} onChange={e => { setBook(e.target.value); setChapter(1); }}>
          {BIBLE_BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
        </Select>
        <Select value={chapter} onChange={e => setChapter(parseInt(e.target.value))}>
          {[...Array(50)].map((_, i) => (
            <option key={i+1} value={i+1}>Ch {i+1}</option>
          ))}
        </Select>
      </div>

      <div className="bible-reader">
        <h2 className="bible-chapter-title">{book} {chapter}</h2>
        {loading ? (
          <div className="bible-loading">Loading scripture...</div>
        ) : (
          <div className="bible-text">
            {verses.map((v) => (
              <span key={v.verse} className="verse-span" onClick={() => handleVerseClick(v)}>
                <sup className="verse-num">{v.verse}</sup> 
                {v.text}{' '}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bible-nav-buttons">
        <Button variant="secondary" onClick={() => setChapter(Math.max(1, chapter - 1))}>
          <ChevronLeft size={20} /> Prev
        </Button>
        <Button variant="secondary" onClick={() => setChapter(chapter + 1)}>
          Next <ChevronRight size={20} />
        </Button>
      </div>

      <BottomSheet 
        isOpen={!!selectedVerse} 
        onClose={() => setSelectedVerse(null)}
        title={`${book} ${chapter}:${selectedVerse?.verse}`}
      >
        {selectedVerse && (
          <div className="verse-actions">
            <p className="verse-preview">"{selectedVerse.text.trim()}"</p>
            <div className="action-list">
              <Button variant="text" className="action-item">
                <Bookmark size={20} /> Bookmark
              </Button>
              <Button variant="text" className="action-item">
                <MessageSquare size={20} /> Add Note
              </Button>
              <Button variant="text" className="action-item">
                <Copy size={20} /> Copy
              </Button>
              <Button variant="text" className="action-item">
                <Link2 size={20} /> Copy Link
              </Button>
              <Button variant="text" className="action-item">
                <Mic size={20} /> View Related Sermons
              </Button>
            </div>
            <Button variant="secondary" onClick={() => setSelectedVerse(null)}>Cancel</Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

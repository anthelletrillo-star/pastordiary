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

// NLT API Key - will be set via environment variable once you register at api.nlt.to
const NLT_API_KEY = import.meta.env.VITE_NLT_API_KEY || '';

// Parse NLT API HTML response into verse objects
const parseNltHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const verses = [];
  
  // NLT API returns HTML with verse numbers in span.vn elements
  const verseNodes = doc.querySelectorAll('.vn');
  
  if (verseNodes.length > 0) {
    verseNodes.forEach((vn) => {
      const verseNum = parseInt(vn.textContent.trim(), 10);
      // Walk siblings collecting text until next verse number
      let text = '';
      let node = vn.nextSibling;
      while (node && !(node.classList && node.classList.contains('vn'))) {
        text += node.textContent || '';
        node = node.nextSibling;
      }
      if (verseNum && text.trim()) {
        verses.push({ verse: verseNum, text: text.trim() });
      }
    });
  }
  
  // Fallback: if parsing didn't work, return the entire text as one block
  if (verses.length === 0) {
    const bodyText = doc.body?.textContent?.trim();
    if (bodyText) {
      verses.push({ verse: 1, text: bodyText });
    }
  }
  
  return verses;
};

export const BiblePage = () => {
  const [book, setBook] = useState('John');
  const [chapter, setChapter] = useState(3);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [usingNlt, setUsingNlt] = useState(!!NLT_API_KEY);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  // Scroll detection to hide controls when scrolling down (Full Screen)
  useEffect(() => {
    let lastScrollY = 0;
    const readerEl = document.querySelector('.bible-reader');
    if (!readerEl) return;

    const handleScroll = () => {
      const currentScrollY = readerEl.scrollTop;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsHeaderHidden(true); // Scrolling down -> Full Screen
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderHidden(false); // Scrolling up -> Show controls
      }
      lastScrollY = currentScrollY;
    };

    readerEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => readerEl.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      try {
        if (NLT_API_KEY) {
          // Use the official NLT API
          const ref = `${book} ${chapter}`;
          const response = await fetch(
            `https://api.nlt.to/api/passages?ref=${encodeURIComponent(ref)}&version=NLT&key=${NLT_API_KEY}`
          );
          const html = await response.text();
          const parsed = parseNltHtml(html);
          setVerses(parsed);
          setUsingNlt(true);
        } else {
          // Fallback to bible-api.com (KJV, public domain)
          const response = await fetch(`https://bible-api.com/${book} ${chapter}?translation=kjv`);
          const data = await response.json();
          setVerses(data.verses || []);
          setUsingNlt(false);
        }
      } catch (err) {
        console.error("Error fetching Bible data", err);
        // Fallback to bible-api.com on any error
        try {
          const response = await fetch(`https://bible-api.com/${book} ${chapter}?translation=kjv`);
          const data = await response.json();
          setVerses(data.verses || []);
          setUsingNlt(false);
        } catch (fallbackErr) {
          console.error("Fallback also failed", fallbackErr);
        }
      }
      setLoading(false);
    };
    
    fetchChapter();
  }, [book, chapter]);

  const handleVerseClick = (verse) => {
    setSelectedVerse(verse);
  };

  return (
    <div className={`page-content bible-page ${isHeaderHidden ? 'header-hidden' : ''}`}>
      <div className={`bible-controls ${isHeaderHidden ? 'hidden' : ''}`}>
        <div className="bible-version-badge">
          {usingNlt ? 'NLT' : 'KJV'}
        </div>
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
        {!usingNlt && (
          <div className="nlt-notice">
            📖 Showing KJV (public domain). To use NLT, add your API key from <a href="https://api.nlt.to/" target="_blank" rel="noopener">api.nlt.to</a>
          </div>
        )}
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

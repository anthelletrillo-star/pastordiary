import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Book, Mic, Calendar as CalendarIcon, Menu, User, Search, ArrowLeft } from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { BiblePage } from './pages/BiblePage';
import { SermonsPage } from './pages/SermonsPage';
import { SermonEditorPage } from './pages/SermonEditorPage';
import { CalendarPage } from './pages/CalendarPage';
import { AppointmentEditorPage } from './pages/AppointmentEditorPage';
import { NotificationManager } from './components/NotificationManager';
import { NotificationBanner } from './components/NotificationBanner';

const MorePage = () => <div className="page-content">More options coming soon...</div>;

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine title based on path
  let title = "Shepherd's Library";
  let leftIcon = <Menu size={24} />;
  let rightIcon = <User size={24} />;
  
  if (location.pathname === '/bible') {
    title = "Bible";
    leftIcon = <ArrowLeft size={24} onClick={() => navigate(-1)} />;
    rightIcon = <Search size={24} />;
  } else if (location.pathname.startsWith('/sermons/')) {
    title = "Sermon Details";
    leftIcon = <ArrowLeft size={24} onClick={() => navigate(-1)} />;
    rightIcon = <MoreVerticalIcon />;
  } else if (location.pathname === '/sermons') {
    title = "Sermons";
    rightIcon = <Search size={24} />;
  } else if (location.pathname === '/calendar') {
    title = "Schedule";
    rightIcon = <Search size={24} />;
  }

  return (
    <div className="top-bar">
      <button className="touch-target">{leftIcon}</button>
      <h1>{title}</h1>
      <button className="touch-target">{rightIcon}</button>
    </div>
  );
};

const MoreVerticalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
);

const BottomNav = ({ badgeCount }) => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`} end>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/bible" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Book size={24} />
        <span>Bible</span>
      </NavLink>
      <NavLink to="/sermons" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Mic size={24} />
        <span>Sermons</span>
      </NavLink>
      <NavLink to="/calendar" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div style={{position: 'relative'}}>
          <CalendarIcon size={24} />
          {badgeCount > 0 && <span className="nav-badge">{badgeCount}</span>}
        </div>
        <span>Calendar</span>
      </NavLink>
      <NavLink to="/more" className={({isActive}) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Menu size={24} />
        <span>More</span>
      </NavLink>
    </nav>
  );
};

const Sidebar = ({ badgeCount }) => {
  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Shepherd's Library</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/bible" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Book size={20} />
          <span>Bible</span>
        </NavLink>
        <NavLink to="/sermons" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Mic size={20} />
          <span>Sermons</span>
        </NavLink>
        <NavLink to="/calendar" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
            <CalendarIcon size={20} />
            {badgeCount > 0 && <span className="nav-badge" style={{position: 'absolute', top: -5, left: 12}}>{badgeCount}</span>}
          </div>
          <span>Calendar</span>
        </NavLink>
        <div style={{ flex: 1 }}></div>
        <NavLink to="/more" className={({isActive}) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
          <Menu size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

function App() {
  const [badgeCount, setBadgeCount] = React.useState(0);
  const [activeNotification, setActiveNotification] = React.useState(null);

  return (
    <BrowserRouter>
      <div className="app-container">
        <NotificationManager 
          onNotification={setActiveNotification}
          onBadgeUpdate={setBadgeCount}
        />
        <NotificationBanner 
          appointment={activeNotification}
          onDismiss={() => setActiveNotification(null)}
        />
        <Sidebar badgeCount={badgeCount} />
        <div className="main-content-wrapper">
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bible" element={<BiblePage />} />
            <Route path="/sermons" element={<SermonsPage />} />
            <Route path="/sermons/:id" element={<SermonEditorPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/calendar/appointment/:id" element={<AppointmentEditorPage />} />
            <Route path="/more" element={<MorePage />} />
          </Routes>
          <BottomNav badgeCount={badgeCount} />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

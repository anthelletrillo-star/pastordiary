import React, { useState, useEffect } from 'react';
import { Download, HardDrive, RefreshCw, Users, BookOpen, CheckCircle, WifiOff } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { syncManager } from '../services/syncManager';
import { getStorageUsage } from '../services/localStore';
import './AdminDashboardPage.css';

export const AdminDashboardPage = () => {
  const [sermons, setSermons] = useState([]);
  const [stats, setStats] = useState({ userCount: 1, sermonCount: 0 });
  const [storageInfo, setStorageInfo] = useState(null);
  const [syncState, setSyncState] = useState({
    isOnline: navigator.onLine,
    isSyncing: false,
    queueCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getSermons();
        setSermons(data);
        setStats(prev => ({ ...prev, sermonCount: data.length }));

        // Storage usage
        const usage = await getStorageUsage();
        setStorageInfo(usage);

        // Queue count
        const count = await syncManager.getQueueCount();
        setSyncState(prev => ({ ...prev, queueCount: count }));
      } catch (err) {
        console.error('Failed to load admin stats', err);
      }
      setLoading(false);
    };

    fetchData();

    const unsubscribe = syncManager.subscribe(async (state) => {
      const count = await syncManager.getQueueCount();
      setSyncState({ ...state, queueCount: count });
    });

    return () => unsubscribe();
  }, []);

  const handleExportSermons = () => {
    if (sermons.length === 0) {
      alert('No sermons to export!');
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sermons, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sermons-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleManualSync = () => {
    syncManager.processQueue();
  };

  return (
    <div className="page-content admin-dashboard">
      <h2 className="admin-title">Admin & System Status</h2>

      <div className="admin-grid">
        {/* Sync & Connectivity Status */}
        <Card className="admin-card">
          <div className="admin-card-header">
            {syncState.isOnline ? <CheckCircle size={20} color="#22c55e" /> : <WifiOff size={20} color="#ef4444" />}
            <span>Network & Sync</span>
          </div>
          <div className="admin-stat-value">
            {syncState.isOnline ? 'Online' : 'Offline Mode'}
          </div>
          <div className="admin-stat-sub">
            {syncState.isSyncing 
              ? 'Syncing changes...' 
              : syncState.queueCount > 0 
                ? `${syncState.queueCount} items queued for sync` 
                : 'All changes synced'}
          </div>
          {syncState.queueCount > 0 && syncState.isOnline && (
            <Button variant="secondary" onClick={handleManualSync} style={{ marginTop: '12px' }}>
              <RefreshCw size={16} style={{ marginRight: '8px' }} /> Sync Now
            </Button>
          )}
        </Card>

        {/* Database Overview */}
        <Card className="admin-card">
          <div className="admin-card-header">
            <BookOpen size={20} />
            <span>Sermon Count</span>
          </div>
          <div className="admin-stat-value">{stats.sermonCount}</div>
          <div className="admin-stat-sub">Total Sermons Stored</div>
          <Button variant="secondary" onClick={handleExportSermons} style={{ marginTop: '12px' }}>
            <Download size={16} style={{ marginRight: '8px' }} /> Export All Sermons (.json)
          </Button>
        </Card>

        {/* User Count */}
        <Card className="admin-card">
          <div className="admin-card-header">
            <Users size={20} />
            <span>Registered Users</span>
          </div>
          <div className="admin-stat-value">{stats.userCount}</div>
          <div className="admin-stat-sub">Active Pastor Account</div>
        </Card>

        {/* Local Storage Info */}
        {storageInfo && (
          <Card className="admin-card">
            <div className="admin-card-header">
              <HardDrive size={20} />
              <span>Offline Device Storage</span>
            </div>
            <div className="admin-stat-value">{storageInfo.usage}</div>
            <div className="admin-stat-sub">Used of {storageInfo.quota} limit ({storageInfo.percent})</div>
          </Card>
        )}
      </div>
    </div>
  );
};

import { syncQueueStore } from './localStore';
import { supabase } from './supabaseClient';

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.listeners = new Set();
    this.apiUrl = import.meta.env.VITE_API_URL || '';

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Attempt sync on startup if online
    if (this.isOnline) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners();
    this.processQueue();
  };

  handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners();
  };

  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  notifyListeners = () => {
    this.listeners.forEach(listener => listener({
      isOnline: this.isOnline,
      isSyncing: this.isSyncing
    }));
  };

  // Push a failed request into the queue
  async enqueueRequest(method, endpoint, payload = null) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await syncQueueStore.setItem(id, {
      method,
      endpoint,
      payload,
      timestamp: Date.now()
    });
    this.notifyListeners();
  }

  async getQueueCount() {
    return await syncQueueStore.length();
  }

  // Process all queued requests
  async processQueue() {
    if (!this.isOnline || this.isSyncing) return;

    const keys = await syncQueueStore.keys();
    if (keys.length === 0) return;

    this.isSyncing = true;
    this.notifyListeners();

    // Sort keys by timestamp to ensure FIFO
    const queue = [];
    for (const key of keys) {
      const item = await syncQueueStore.getItem(key);
      queue.push({ key, ...item });
    }
    queue.sort((a, b) => a.timestamp - b.timestamp);

    for (const item of queue) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = {
          'Content-Type': 'application/json'
        };
        if (session) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const response = await fetch(`${this.apiUrl}${item.endpoint}`, {
          method: item.method,
          headers,
          body: item.payload ? JSON.stringify(item.payload) : undefined
        });

        if (response.ok) {
          // Success! Remove from queue
          await syncQueueStore.removeItem(item.key);
        } else {
          // If a request fails with 4xx, it might be a bad request that will never succeed. 
          // For now, we only retry 5xx network errors. If it's a 4xx, we should probably discard it or log it.
          if (response.status >= 400 && response.status < 500) {
             console.error('Sync request failed permanently (4xx):', item);
             await syncQueueStore.removeItem(item.key);
          } else {
            throw new Error(`Server returned ${response.status}`);
          }
        }
      } catch (err) {
        console.error('Failed to sync item, will retry later:', err);
        // Break out of loop so we don't try subsequent items that might depend on this one
        break; 
      }
    }

    this.isSyncing = false;
    this.notifyListeners();
  }
}

export const syncManager = new SyncManager();

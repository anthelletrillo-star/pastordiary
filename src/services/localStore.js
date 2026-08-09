import localforage from 'localforage';

// Configure specific instances for different data types
export const sermonsStore = localforage.createInstance({
  name: 'pastorsDiary',
  storeName: 'sermons'
});

export const appointmentsStore = localforage.createInstance({
  name: 'pastorsDiary',
  storeName: 'appointments'
});

export const syncQueueStore = localforage.createInstance({
  name: 'pastorsDiary',
  storeName: 'syncQueue'
});

// Helper to get total storage usage estimation
export const getStorageUsage = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimation = await navigator.storage.estimate();
    return {
      usage: (estimation.usage / 1024 / 1024).toFixed(2) + ' MB',
      quota: (estimation.quota / 1024 / 1024).toFixed(2) + ' MB',
      percent: ((estimation.usage / estimation.quota) * 100).toFixed(2) + '%'
    };
  }
  return null;
};

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  // Sermons
  async getSermons() {
    const res = await fetch(`${API_URL}/api/sermons`);
    if (!res.ok) throw new Error('Failed to fetch sermons');
    return res.json();
  },

  async getSermon(id) {
    const res = await fetch(`${API_URL}/api/sermons/${id}`);
    if (!res.ok) throw new Error('Failed to fetch sermon');
    return res.json();
  },

  async createSermon(sermon) {
    const res = await fetch(`${API_URL}/api/sermons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sermon),
    });
    if (!res.ok) throw new Error('Failed to create sermon');
    return res.json();
  },

  async updateSermon(id, sermon) {
    const res = await fetch(`${API_URL}/api/sermons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sermon),
    });
    if (!res.ok) throw new Error('Failed to update sermon');
    return res.json();
  },

  async deleteSermon(id) {
    const res = await fetch(`${API_URL}/api/sermons/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete sermon');
    return res.json();
  },

  // File Upload
  async uploadFile(fileName, fileType, fileData, sermonId) {
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, fileType, fileData, sermonId }),
    });
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  },

  // Appointments
  async getAppointments(from, to) {
    let url = `${API_URL}/api/appointments`;
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async getAppointment(id) {
    const res = await fetch(`${API_URL}/api/appointments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch appointment');
    return res.json();
  },

  async createAppointment(appointment) {
    const res = await fetch(`${API_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error('Failed to create appointment');
    return res.json();
  },

  async updateAppointment(id, appointment) {
    const res = await fetch(`${API_URL}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error('Failed to update appointment');
    return res.json();
  },

  async deleteAppointment(id) {
    const res = await fetch(`${API_URL}/api/appointments/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete appointment');
    return res.json();
  },

  async getUpcomingAppointments() {
    const res = await fetch(`${API_URL}/api/appointments/upcoming`);
    if (!res.ok) throw new Error('Failed to fetch upcoming appointments');
    return res.json();
  },

  async getTodayAppointmentCount() {
    const res = await fetch(`${API_URL}/api/appointments/today-count`);
    if (!res.ok) throw new Error('Failed to fetch appointment count');
    return res.json();
  },

  async markAppointmentReminded(id) {
    const res = await fetch(`${API_URL}/api/appointments/${id}/reminded`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark appointment as reminded');
    return res.json();
  },
};

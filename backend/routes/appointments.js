const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all appointments (optionally filter by date range)
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (req.query.from) {
      query = query.gte('date', req.query.from);
    }
    if (req.query.to) {
      query = query.lte('date', req.query.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET upcoming appointments that need reminders
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get all appointments for today that haven't been reminded yet
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', today)
      .eq('is_reminded', false)
      .order('time', { ascending: true });

    if (error) throw error;

    // Filter to only those within the reminder window
    const upcoming = data.filter(appt => {
      const apptDateTime = new Date(`${appt.date}T${appt.time}`);
      const reminderTime = new Date(apptDateTime.getTime() - (appt.reminder_minutes * 60 * 1000));
      return now >= reminderTime && now < apptDateTime;
    });

    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET today's appointment count (for badges)
router.get('/today-count', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('date', today);

    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single appointment
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// POST create appointment
router.post('/', async (req, res) => {
  try {
    const { title, description, date, time, location, reminder_minutes } = req.body;
    const { data, error } = await supabase
      .from('appointments')
      .insert([{ title, description, date, time, location, reminder_minutes }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update appointment
router.put('/:id', async (req, res) => {
  try {
    const { title, description, date, time, location, reminder_minutes, is_reminded } = req.body;
    const { data, error } = await supabase
      .from('appointments')
      .update({ title, description, date, time, location, reminder_minutes, is_reminded })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH mark as reminded
router.patch('/:id/reminded', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ is_reminded: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

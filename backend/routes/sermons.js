const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET all sermons
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single sermon by id
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Sermon not found' });
  }
});

// POST create a new sermon
router.post('/', async (req, res) => {
  try {
    const { title, date, passage, series, status, content } = req.body;
    const { data, error } = await supabase
      .from('sermons')
      .insert([{ title, date, passage, series, status, content }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a sermon
router.put('/:id', async (req, res) => {
  try {
    const { title, date, passage, series, status, content } = req.body;
    const { data, error } = await supabase
      .from('sermons')
      .update({ title, date, passage, series, status, content })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a sermon
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Sermon deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

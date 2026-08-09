const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Upload a file to Supabase Storage
router.post('/', async (req, res) => {
  try {
    // For now, we expect a base64 encoded file from the frontend
    const { fileName, fileType, fileData, sermonId } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'fileName and fileData are required' });
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(fileData, 'base64');
    const filePath = `sermons/${sermonId || 'general'}/${Date.now()}_${fileName}`;

    const { data, error } = await supabase.storage
      .from('attachments')
      .upload(filePath, buffer, {
        contentType: fileType || 'application/octet-stream',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    res.status(201).json({
      message: 'File uploaded successfully',
      path: filePath,
      publicUrl: urlData.publicUrl
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

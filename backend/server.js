require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sermonsRoutes = require('./routes/sermons');
const appointmentsRoutes = require('./routes/appointments');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for file uploads

// Routes
app.use('/api/sermons', sermonsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Pastor's Diary backend running on port ${PORT}`);
  });
}

module.exports = app;

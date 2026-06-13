const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const { handleRedirect } = require('./controllers/redirect.controller');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: clientUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parsers & Logger
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// API Routing
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Redirection routing (public, at the root level)
app.get('/:shortCode', handleRedirect);

// 404 Route handling (for unmatched routes)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`  SnapLink API Server Running    `);
  console.log(`  Port: ${PORT}                  `);
  console.log(`  Client: ${clientUrl}           `);
  console.log(`=================================`);
});

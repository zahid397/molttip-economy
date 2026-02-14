const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimiter = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const logger = require('./config/logger');
const { frontendUrl } = require('./config/env');

const app = express();

app.set('trust proxy', 1);

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parser
app.use(express.json({ limit: '1mb' }));

// Logger
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// Rate limit only API routes
app.use('/api', rateLimiter);

// Routes
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/tips', require('./routes/tip.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MoltTip API is running 🚀',
  });
});

// Not found handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;

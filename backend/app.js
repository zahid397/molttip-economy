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

/* =========================
   SECURITY MIDDLEWARE
========================= */
app.use(helmet());

/* =========================
   CORS CONFIG
========================= */
app.use(
  cors({
    origin: frontendUrl || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/* =========================
   BODY PARSER
========================= */
app.use(express.json({ limit: '1mb' }));

/* =========================
   LOGGER
========================= */
app.use(
  morgan('combined', {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  })
);

/* =========================
   RATE LIMIT
========================= */
app.use('/api', rateLimiter);

/* =========================
   API ROUTES
========================= */
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/comments', require('./routes/comment.routes'));
app.use('/api/tips', require('./routes/tip.routes'));
app.use('/api/leaderboard', require('./routes/leaderboard.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

/* =========================
   ROOT ROUTE
========================= */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 MoltTip API is running (In-Memory Mode)',
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   FAVICON FIX
========================= */
app.get('/favicon.ico', (req, res) => res.status(204).end());

/* =========================
   NOT FOUND
========================= */
app.use(notFound);

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use(errorHandler);

module.exports = app;

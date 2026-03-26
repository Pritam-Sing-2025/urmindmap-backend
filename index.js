import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mindMapRoutes from './routes/mindmapRoutes.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5001);

app.disable('x-powered-by');

function parseEnvList(value) {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function matchesOriginPattern(origin, pattern) {
  const normalizedPattern = pattern.trim();

  if (!normalizedPattern) {
    return false;
  }

  const patternRegex = new RegExp(
    `^${escapeRegExp(normalizedPattern).replace(/\\\*/g, '.*')}$`
  );

  return patternRegex.test(origin);
}

const allowedOrigins = parseEnvList(
  process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN
);
const allowedOriginPatterns = parseEnvList(
  process.env.ALLOWED_ORIGIN_PATTERNS || process.env.ALLOWED_ORIGIN_PATTERN
);

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  if (!allowedOrigins.length && !allowedOriginPatterns.length) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return allowedOriginPatterns.some((pattern) => matchesOriginPattern(origin, pattern));
}

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    const error = new Error(`Origin ${origin} is not allowed by CORS.`);
    error.statusCode = 403;
    error.expose = true;

    return callback(error);
  },
  methods: ['GET', 'HEAD', 'POST', 'OPTIONS'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

function sendHealthResponse(response) {
  response.status(200).json({
    status: 'ok',
    service: 'mindmap-server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}

app.get('/', (request, response) => {
  response.status(200).json({
    name: 'mindmap-server',
    status: 'ready',
    docs: {
      health: '/api/health',
      generateMindMap: '/api/generate-mindmap'
    }
  });
});

app.get('/health', (request, response) => {
  sendHealthResponse(response);
});

app.get('/api/health', (request, response) => {
  sendHealthResponse(response);
});

app.use('/api', mindMapRoutes);
app.use('/', mindMapRoutes);

app.use((request, response) => {
  response.status(404).json({
    error: 'Route not found.'
  });
});

app.use((error, request, response, next) => {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  if (response.headersSent) {
    return next(error);
  }

  response.status(statusCode).json({
    error:
      error.expose && error.message
        ? error.message
        : 'Something went wrong while generating the mind map.'
  });
});

const server = app.listen(port, () => {
  console.log(`Mind map API listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  shutdown('uncaughtException');
});

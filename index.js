import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mindMapRoutes from './routes/mindmapRoutes.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5001);
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : true;

app.use(
  cors({
    origin: allowedOrigins
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'ai-notes-mindmap-api',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', mindMapRoutes);
app.use('/', mindMapRoutes);

app.use((error, request, response, next) => {
  console.error(error);

  if (response.headersSent) {
    return next(error);
  }

  response.status(error.statusCode || 500).json({
    error:
      error.expose && error.message
        ? error.message
        : 'Something went wrong while generating the mind map.'
  });
});

app.listen(port, () => {
  console.log(`Mind map API listening on http://localhost:${port}`);
});


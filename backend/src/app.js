import express from 'express';
import cors from 'cors';
import askRouter from './routes/ask.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

/**
 * Express application setup.
 *
 * - Enables CORS and JSON body parsing.
 * - Exposes a health check endpoint at `GET /health`.
 * - Mounts the `askRouter` under `/api/ask` for handling question queries.
 * - Uses `notFound` middleware for unmatched routes (404 handler).
 * - Uses `errorHandler` middleware for global error handling.
 *
 * @type {import('express').Application}
 */
const app = express();

app.use(cors());
app.use(express.json());

/**
 * Health check route.
 * @route GET /health
 * @returns {object} 200 - `{ ok: true }` if server is running.
 */
app.get('/health', (_req, res) => res.json({ ok: true }));

// Mount routes
app.use('/api/ask', askRouter);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;

import express from 'express';
import cors from 'cors';
import askRouter from './routes/ask.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/ask', askRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

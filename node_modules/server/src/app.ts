import express from 'express';
import cors from 'cors';
import recordsRouter from './routes/records.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', recordsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

export default app;

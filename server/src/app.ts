import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health.routes';
import apiRoutes from './routes/api';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';
import env from './config/env';

const app = express();

const allowedOrigin =
  env.NODE_ENV === 'production'
    ? env.CLIENT_URL
    : undefined;

app.use(
  cors(
    allowedOrigin
      ? {
          origin: allowedOrigin,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true,
        }
      : undefined,
  ),
);

app.use(express.json());
app.use(requestLogger);

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'HealWise API',
    time: new Date().toISOString(),
  });
});

app.use('/health', healthRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

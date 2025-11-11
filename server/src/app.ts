import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';
import apiRoutes from './routes/api';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFoundHandler';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/health', healthRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

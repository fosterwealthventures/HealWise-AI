import app from './app';
import env from './config/env';
import { logger } from './utils/logger';

const start = () => {
  const server = app.listen(env.PORT, () => {
    logger.info(`HealWise API listening on port ${env.PORT}`);
  });

  const shutdown = () => {
    logger.info('Shutting down server');
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise rejection', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { message: error.message, stack: error.stack });
    process.exit(1);
  });
};

start();

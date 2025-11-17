import { createServer } from 'http';

import { createApp } from './app';
import { env } from './config/env';
import { logger } from './middleware/logger';

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  logger.info(`API ready on http://localhost:${env.PORT}`);
});


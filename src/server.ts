import http from 'http';
import express from 'express';
import { applyMiddleware, applyRoutes } from './utils';
import middleware from './middleware';
import errorHandlers from './middleware/errorHandlers';
import routes from './services';
import { logger } from './config/winston';

process.on('uncaughtException', (error: Error): void => {
    logger.error(error);
    process.exit(1);
});

// @ts-ignore
process.on('unhandledRejection', (error: Error): void => {
    logger.error(error);
    process.exit(1);
});
// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.
// initSessionStore();

const router = express();

applyMiddleware(middleware, router);
applyRoutes(routes, router);
applyMiddleware(errorHandlers, router);

const { PORT = 3000 } = process.env;
const server = http.createServer(router);

server.listen(Number(PORT), () => logger.info(`Server is running http://localhost:${PORT}`));

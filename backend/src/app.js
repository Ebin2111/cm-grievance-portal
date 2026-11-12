const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.CLIENT_URL.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '1mb' }));
if (env.NODE_ENV !== 'test') app.use(morgan('tiny'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'cm-grievance-api (recruitment prototype)' }));
app.use('/api/v1', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const winston = require('winston');
const promClient = require('prom-client');
const registerWithConsul = require('./lib/consul-register');


const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
const productRoutes = require('../src/routes/productRoutes')

//Routes
app.use('/api/v1/product', productRoutes)
// ------------------------------
// Environment Variables
// ------------------------------
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Handle both local & docker Mongo URIs
const MONGO_URI =
  process.env.MONGO_URI ||
  (NODE_ENV === 'production'
    ? 'mongodb://mongo:27017/productdb'
    : 'mongodb://localhost:27017/productdb');

// Handle both local & docker Consul hosts
const CONSUL_HOST =
  process.env.CONSUL_HOST ||
  (NODE_ENV === 'production' ? 'consul' : 'localhost');

console.log('MONGO_URI:', MONGO_URI);
console.log('CONSUL_HOST:', CONSUL_HOST);

// ------------------------------
// Logger Configuration
// ------------------------------
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'product-service' },
  transports: [new winston.transports.Console()],
});

// ------------------------------
// Express Setup
// ------------------------------




// ------------------------------
// Prometheus Metrics
// ------------------------------
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 500, 1000],
});

app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, code: res.statusCode });
  });
  next();
});



// ------------------------------
// Health & Metrics Endpoints
// ------------------------------
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.send(await promClient.register.metrics());
});

// ------------------------------
// Example Route (temporary test)
// ------------------------------
// app.get('/api/v1/products/test', (req, res) => {
//   res.json({ message: 'Product service is up ✅' });
// });

// ------------------------------
// Global Error Handler
// ------------------------------
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'internal_server_error' });
});

// ------------------------------
// Mongo Connection + Consul Registration
// ------------------------------
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    logger.info('Connected to MongoDB');

    app.listen(PORT, async () => {
      logger.info(`Product Service listening on port ${PORT}`);

      // Register with Consul only if available
      try {
        await registerWithConsul({
          name: 'product-service',
          host: CONSUL_HOST,
          port: PORT,
        });
        logger.info('Registered with Consul (if available)');
      } catch (err) {
        logger.warn(`Consul registration failed: ${err.message || err}`);
      }
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  });

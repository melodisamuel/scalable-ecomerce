const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require(cors);
const bodyParser = require('body-parser');
const winston = require('winston');
const promClient = require('prom-client');
// const registerWithConsul = require('./lib/consul-register');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const CONSUL_HOST = process.env.CONSUL_HOST;


// logger 
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'product-service' },
    transports: [new winston.transports.Console()]
});

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of Http requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 500, 1000]
});

app.use((req, res, next) => {
    const end =httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.path, code: res.statusCode });
    });
    next();
});

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.send(await promClient.register.metrics());
});

// routes


// error handler 
app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ error: 'internal_server_error' });
});

// connect to mongo then start 
mongoose.connect(MONGO_URI).then(async () => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, async () => {
        logger.info(`Product Service listening on port ${PORT}`);
        // try to register with consul
        // try {
        //     await registerWithConsul({ name: 'product-service', host: CONSUL_HOST, port: PORT });
        //     logger.info("Registered with cosul (if available)");
        // } catch (e) {
        //     logger.warn('Consul registration failed (ignored):', e.message || e);
        // }
    });
}).catch(err => {
    logger.error('MongoDB connection error', err);
    process.exit(1);
});
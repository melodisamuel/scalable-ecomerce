require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const redis = require('ioredis');
const dotenv = require('dotenv');
const userRoutes = require('../src/routes/userRoutes')

// const consulRegister = require('./lib/consul-register');


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

//Routes
app.use('/api/v1/users', userRoutes)

const PORT = process.env.PORT || 4001
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/userdb';
const REDIS_URL = process.env.REDIS_URL ||  'redis://localhost:6379';
// const CONSUL_HOST = process.env.CONSUL_HOST || 'localhost';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// connect redis
const redisClient = new redis(REDIS_URL);
redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (e) => console.error('Redis error', e));

app.listen(PORT, async () => {
    console.log(`User service listening on ${PORT}`);
    // register with consul (best-effort)
    // try { await consulRegister({ name: 'user-service', host: CONSUL_HOST, port: PORT}); } catch (e) { console.warn('consul register failed', e.message); }
});
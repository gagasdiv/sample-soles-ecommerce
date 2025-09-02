// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 22030;
app.use(bodyParser.json());

const orderEventsRoutes = require('./eventsRoutes/orderEventsRoutes');
const productEventsRoutes = require('./eventsRoutes/productEventsRoutes');

// Disable CORS entirely
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// Load events routers
orderEventsRoutes();
productEventsRoutes();

// Import the database configuration
const db = require('./config/database');
const models = require('./models');

async function main() {
  // Connect to the database and start the server
  try {
    await db.authenticate();
    console.log('Database connected...');
    // Optionally sync models (force: false for production)
    await models.sequelize.sync({ alter: true });
    await models.populate();
  } catch (err) {
    console.error('Error connecting to the database: ', err);
  }

  app.listen(port, () => {
    console.log(`Inventory Service listening on port ${port}`);
  });
}

main();

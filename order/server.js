// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

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

async function main() {
  // Import database
  const { sequelize } = require('./models');
  // await sequelize.query('PRAGMA foreign_keys = false;');
  await sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
  });
  // await sequelize.query('PRAGMA foreign_keys = true;');

  // Import order routes
  const orderRoutes = require('./routes/orderRoutes');
  const orderStatusRoutes = require('./eventRoutes/orderStatusRoutes');
  app.use('/order', orderRoutes);
  orderStatusRoutes();

  // Start the server
  const PORT = process.env.PORT || 22020;
  app.listen(PORT, () => {
    console.log(`Order Service is running on port ${PORT}`);
  });
}

main();

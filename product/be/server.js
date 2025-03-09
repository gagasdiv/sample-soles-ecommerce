require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 22010;

// Middleware to parse JSON
app.use(express.json());

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

// Import and use product routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Import the database configuration
const db = require('./config/database');

async function main() {
  // Connect to the database and start the server
  try {
    await db.authenticate();
    console.log('Database connected...');
    // Optionally sync models (force: false for production)
    const models = require('./models');
    models.sequelize.sync();
    models.populate();
  } catch (err) {
    console.error('Error connecting to the database: ', err);
  }

  app.listen(port, () => {
    console.log(`Product Service listening on port ${port}`);
  });
}

main();

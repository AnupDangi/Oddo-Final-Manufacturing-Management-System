
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import  database from './config/database.js';
// import authRoutes from './routes/auth.js';
// import userRoutes from './routes/users.js';
// import productRoutes from './routes/products.js';
// import workCenterRoutes from './routes/workCenters.js';
// import bomRoutes from './routes/boms.js';
// import manufacturingOrderRoutes from './routes/manufacturingOrders.js';
// import workOrderRoutes from './routes/workOrders.js';
// import stockLedgerRoutes from './routes/stockLedger.js';
// import dashboardRoutes from './routes/dashboard.js';

const app = express()
const PORT = process.env.PORT
app.use(express.json())
app.use('/api/auth',userRoutes)
app.use('/api/products',productRoutes);
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/products', productRoutes);
// app.use('/api/v1/work-centers', workCenterRoutes);
// app.use('/api/v1/boms', bomRoutes);
// app.use('/api/v1/manufacturing-orders', manufacturingOrderRoutes);
// app.use('/api/v1/work-orders', workOrderRoutes);
// app.use('/api/v1/stock-ledger', stockLedgerRoutes);
// app.use('/api/v1/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();

    // Optional: test and initialize
    const test = await database.testConnection();
    console.log('DB Test:', test);

    await database.initializeDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};


startServer();
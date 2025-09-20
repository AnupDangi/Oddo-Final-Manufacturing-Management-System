
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';

const app = express()
const PORT = process.env.PORT

const startServer = async () => {
  try {
    // Test Supabase connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to Supabase. Please check your configuration.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
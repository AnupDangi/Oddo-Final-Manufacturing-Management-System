import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MongoDB Connection Configuration for Manufacturing ERP System
 * Using MongoDB Atlas with Mongoose ODM
 */

class Database {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.dbName = process.env.DB_NAME || 'manufacturing_erp';
    this.connection = null;
  }

  /**
   * Connect to MongoDB Atlas
   */
  async connect() {
    try {
      // Set mongoose options
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        w: 'majority'
      };

      console.log('Connecting to MongoDB Atlas...');
      
      this.connection = await mongoose.connect(this.mongoUri, options);
      
      console.log(`✅ Successfully connected to MongoDB Atlas`);
      console.log(`📂 Database: ${this.connection.connection.db.databaseName}`);
      console.log(`🌐 Host: ${this.connection.connection.host}`);
      console.log(`🔗 Connection State: ${this.getConnectionState()}`);

      // Handle connection events
      this.setupEventHandlers();

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB Atlas connection failed:', error.message);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Setup event handlers for mongoose connection
   */
  setupEventHandlers() {
    mongoose.connection.on('connected', () => {
      console.log('🟢 Mongoose connected to MongoDB Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('🔴 Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🟡 Mongoose disconnected from MongoDB Atlas');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      console.log('🔌 MongoDB Atlas connection closed due to app termination');
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        console.log('✅ MongoDB Atlas connection closed');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB Atlas:', error);
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Check if database is connected
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  /**
   * Get database connection instance
   */
  getConnection() {
    return mongoose.connection;
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected');
      }

      const admin = mongoose.connection.db.admin();
      const stats = await admin.serverStatus();
      
      return {
        database: this.connection.connection.db.databaseName,
        host: this.connection.connection.host,
        version: stats.version,
        uptime: stats.uptime,
        connections: stats.connections,
        memory: stats.mem,
        network: stats.network
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      if (!this.isConnected()) {
        throw new Error('Database not connected');
      }

      // Perform a simple operation to test connection
      await mongoose.connection.db.admin().ping();
      
      return {
        success: true,
        message: 'Database connection successful',
        database: this.connection.connection.db.databaseName,
        state: this.getConnectionState()
      };
    } catch (error) {
      return {
        success: false,
        message: `Database connection test failed: ${error.message}`,
        state: this.getConnectionState()
      };
    }
  }

  /**
   * Initialize database with indexes and constraints
   */
  async initializeDatabase() {
    try {
      console.log('🔧 Initializing database indexes and constraints...');
      
      // This will be called after all models are defined
      // to ensure proper indexing for performance
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`📚 Found ${collections.length} collections in database`);
      
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const database = new Database();

export default database;

// Export mongoose for model definitions
export { mongoose };
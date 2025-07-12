require('dotenv').config();
const database = require('./database');
const app = require('./api');

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting AliExpress Dropshipping API...');
    
    // Initialize database
    await database.init();
    console.log('✅ Database initialized');
    
    // Server is started in api.js
    console.log('🎉 AliExpress Dropshipping API is ready!');
    console.log('');
    console.log('📋 Available endpoints:');
    console.log('  GET  /api/health                    - Health check');
    console.log('  POST /api/products/import            - Import AliExpress product');
    console.log('  GET  /api/products                   - Get all AliExpress products');
    console.log('  GET  /api/products/:id               - Get specific product');
    console.log('  POST /api/store/products             - Create store product');
    console.log('  GET  /api/store/products             - Get store products');
    console.log('  POST /api/orders/create              - Create AliExpress order');
    console.log('  GET  /api/orders                     - Get all orders');
    console.log('  GET  /api/orders/:id                 - Get specific order');
    console.log('  POST /api/orders/:id/process         - Process order manually');
    console.log('  GET  /api/search?q=query&limit=10   - Search AliExpress products');
    console.log('');
    console.log('🔧 Environment variables needed:');
    console.log('  ALIEXPRESS_EMAIL     - Your AliExpress email');
    console.log('  ALIEXPRESS_PASSWORD  - Your AliExpress password');
    console.log('  PORT                 - Server port (default: 3001)');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  database.close();
  process.exit(0);
});

// Start the server
startServer(); 
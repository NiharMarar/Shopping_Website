const express = require('express');
const cors = require('cors');
const database = require('./database');
const AliExpressScraper = require('./scraper');
const AliExpressOrderAutomation = require('./orderAutomation');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
database.init().catch(console.error);

// API Routes

// 1. Product Management
app.post('/api/products/import', async (req, res) => {
  try {
    const { productUrl } = req.body;
    
    if (!productUrl) {
      return res.status(400).json({ error: 'Product URL is required' });
    }

    console.log('📦 Importing product from:', productUrl);
    
    const scraper = new AliExpressScraper();
    await scraper.init();
    
    const productData = await scraper.scrapeProduct(productUrl);
    await scraper.close();
    
    res.json({ 
      success: true, 
      product: productData,
      message: 'Product imported successfully' 
    });
    
  } catch (error) {
    console.error('❌ Product import error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await database.getAllAliExpressProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await database.getAliExpressProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Get product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Store Products (with markup)
app.post('/api/store/products', async (req, res) => {
  try {
    const { aliexpress_product_id, name, description, price, markup_percentage } = req.body;
    
    if (!aliexpress_product_id || !name || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const storeProduct = await database.addStoreProduct({
      aliexpress_product_id,
      name,
      description,
      price,
      markup_percentage
    });
    
    res.json({ 
      success: true, 
      product: storeProduct,
      message: 'Store product created successfully' 
    });
    
  } catch (error) {
    console.error('❌ Create store product error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/store/products', async (req, res) => {
  try {
    const products = await database.getStoreProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Get store products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Order Management
app.post('/api/orders/create', async (req, res) => {
  try {
    const { 
      store_order_id, 
      aliexpress_product_id, 
      quantity, 
      customer_address 
    } = req.body;
    
    if (!store_order_id || !aliexpress_product_id || !quantity || !customer_address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔄 Creating AliExpress order for store order:', store_order_id);
    
    // Create order record in database
    const orderData = {
      store_order_id,
      aliexpress_product_id,
      quantity,
      total_price: 0, // Will be updated after order placement
      status: 'pending'
    };
    
    const order = await database.createAliExpressOrder(orderData);
    
    res.json({ 
      success: true, 
      order,
      message: 'Order created successfully. Will be processed automatically.' 
    });
    
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await database.all(`
      SELECT ao.*, ap.title as product_title
      FROM aliexpress_orders ao
      JOIN aliexpress_products ap ON ao.aliexpress_product_id = ap.id
      ORDER BY ao.order_date DESC
    `);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await database.get(`
      SELECT ao.*, ap.title as product_title
      FROM aliexpress_orders ao
      JOIN aliexpress_products ap ON ao.aliexpress_product_id = ap.id
      WHERE ao.id = ?
    `, [req.params.id]);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Manual Order Processing
app.post('/api/orders/:id/process', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { customer_address } = req.body;
    
    if (!customer_address) {
      return res.status(400).json({ error: 'Customer address is required' });
    }

    console.log(`🔄 Manually processing order ${orderId}`);
    
    const automation = new AliExpressOrderAutomation();
    await automation.init();
    
    // Login to AliExpress
    const email = process.env.ALIEXPRESS_EMAIL;
    const password = process.env.ALIEXPRESS_PASSWORD;
    
    if (!email || !password) {
      return res.status(500).json({ error: 'AliExpress credentials not configured' });
    }
    
    await automation.login(email, password);
    
    // Get order details
    const order = await database.get('SELECT * FROM aliexpress_orders WHERE id = ?', [orderId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Process the order
    const result = await automation.processStoreOrder(
      order.store_order_id,
      order.aliexpress_product_id,
      order.quantity,
      customer_address
    );
    
    await automation.close();
    
    res.json({ 
      success: true, 
      result,
      message: 'Order processed successfully' 
    });
    
  } catch (error) {
    console.error('❌ Process order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Search Products
app.get('/api/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    console.log(`🔍 Searching for: ${q}`);
    
    const scraper = new AliExpressScraper();
    await scraper.init();
    
    const productUrls = await scraper.searchProducts(q, parseInt(limit));
    await scraper.close();
    
    res.json({ 
      success: true, 
      productUrls,
      count: productUrls.length 
    });
    
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ API Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AliExpress API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app; 
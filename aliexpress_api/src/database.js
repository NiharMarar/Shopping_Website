const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, '../data/products.db');
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection error:', err);
          reject(err);
        } else {
          console.log('✅ Database connected');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      // AliExpress products table
      `CREATE TABLE IF NOT EXISTS aliexpress_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aliexpress_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        original_price REAL,
        currency TEXT DEFAULT 'USD',
        images TEXT, -- JSON array of image URLs
        category TEXT,
        seller_name TEXT,
        seller_rating REAL,
        shipping_info TEXT, -- JSON object
        stock_quantity INTEGER,
        min_order_quantity INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Our store products (with markup)
      `CREATE TABLE IF NOT EXISTS store_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aliexpress_product_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL, -- Our selling price
        markup_percentage REAL DEFAULT 30.0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aliexpress_product_id) REFERENCES aliexpress_products(id)
      )`,

      // AliExpress orders
      `CREATE TABLE IF NOT EXISTS aliexpress_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_order_id TEXT NOT NULL, -- Our e-commerce order ID
        aliexpress_order_id TEXT,
        aliexpress_product_id TEXT,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        tracking_number TEXT,
        tracking_url TEXT,
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        shipped_date DATETIME,
        delivered_date DATETIME,
        notes TEXT
      )`,

      // Tracking updates
      `CREATE TABLE IF NOT EXISTS tracking_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aliexpress_order_id INTEGER,
        status TEXT NOT NULL,
        location TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        FOREIGN KEY (aliexpress_order_id) REFERENCES aliexpress_orders(id)
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }
    console.log('✅ Database tables created');
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('❌ Database run error:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ Database get error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('❌ Database all error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Product operations
  async addAliExpressProduct(productData) {
    const sql = `
      INSERT OR REPLACE INTO aliexpress_products 
      (aliexpress_id, title, description, price, original_price, currency, images, category, seller_name, seller_rating, shipping_info, stock_quantity, min_order_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      productData.aliexpress_id,
      productData.title,
      productData.description,
      productData.price,
      productData.original_price,
      productData.currency || 'USD',
      JSON.stringify(productData.images || []),
      productData.category,
      productData.seller_name,
      productData.seller_rating,
      JSON.stringify(productData.shipping_info || {}),
      productData.stock_quantity,
      productData.min_order_quantity || 1
    ];

    return this.run(sql, params);
  }

  async getAliExpressProduct(aliexpressId) {
    return this.get('SELECT * FROM aliexpress_products WHERE aliexpress_id = ?', [aliexpressId]);
  }

  async getAllAliExpressProducts() {
    return this.all('SELECT * FROM aliexpress_products ORDER BY created_at DESC');
  }

  // Store product operations
  async addStoreProduct(storeProductData) {
    const sql = `
      INSERT INTO store_products 
      (aliexpress_product_id, name, description, price, markup_percentage, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      storeProductData.aliexpress_product_id,
      storeProductData.name,
      storeProductData.description,
      storeProductData.price,
      storeProductData.markup_percentage || 30.0,
      storeProductData.status || 'active'
    ];

    return this.run(sql, params);
  }

  async getStoreProducts() {
    return this.all(`
      SELECT sp.*, ap.title as aliexpress_title, ap.images as aliexpress_images
      FROM store_products sp
      JOIN aliexpress_products ap ON sp.aliexpress_product_id = ap.id
      WHERE sp.status = 'active'
      ORDER BY sp.created_at DESC
    `);
  }

  // Order operations
  async createAliExpressOrder(orderData) {
    const sql = `
      INSERT INTO aliexpress_orders 
      (store_order_id, aliexpress_product_id, quantity, total_price, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      orderData.store_order_id,
      orderData.aliexpress_product_id,
      orderData.quantity,
      orderData.total_price,
      orderData.status || 'pending'
    ];

    return this.run(sql, params);
  }

  async updateOrderStatus(orderId, status, trackingNumber = null) {
    const sql = `
      UPDATE aliexpress_orders 
      SET status = ?, tracking_number = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return this.run(sql, [status, trackingNumber, orderId]);
  }

  async getPendingOrders() {
    return this.all(`
      SELECT ao.*, ap.title as product_title
      FROM aliexpress_orders ao
      JOIN aliexpress_products ap ON ao.aliexpress_product_id = ap.id
      WHERE ao.status = 'pending'
      ORDER BY ao.order_date ASC
    `);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new Database(); 
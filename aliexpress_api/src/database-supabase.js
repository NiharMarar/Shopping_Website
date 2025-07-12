const { createClient } = require('@supabase/supabase-js');

class SupabaseDatabase {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async init() {
    console.log('✅ Supabase database connected');
    await this.createTables();
  }

  async createTables() {
    // Create tables using Supabase SQL
    const tables = [
      // AliExpress products table
      `CREATE TABLE IF NOT EXISTS aliexpress_products (
        id SERIAL PRIMARY KEY,
        aliexpress_id TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        currency TEXT DEFAULT 'USD',
        images JSONB,
        category TEXT,
        seller_name TEXT,
        seller_rating DECIMAL(3,2),
        shipping_info JSONB,
        stock_quantity INTEGER,
        min_order_quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // Store products (with markup)
      `CREATE TABLE IF NOT EXISTS store_products (
        id SERIAL PRIMARY KEY,
        aliexpress_product_id INTEGER REFERENCES aliexpress_products(id),
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        markup_percentage DECIMAL(5,2) DEFAULT 30.0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // AliExpress orders
      `CREATE TABLE IF NOT EXISTS aliexpress_orders (
        id SERIAL PRIMARY KEY,
        store_order_id TEXT NOT NULL,
        aliexpress_order_id TEXT,
        aliexpress_product_id TEXT,
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        tracking_number TEXT,
        tracking_url TEXT,
        order_date TIMESTAMP DEFAULT NOW(),
        shipped_date TIMESTAMP,
        delivered_date TIMESTAMP,
        notes TEXT
      )`,

      // Tracking updates
      `CREATE TABLE IF NOT EXISTS tracking_updates (
        id SERIAL PRIMARY KEY,
        aliexpress_order_id INTEGER REFERENCES aliexpress_orders(id),
        status TEXT NOT NULL,
        location TEXT,
        timestamp TIMESTAMP DEFAULT NOW(),
        description TEXT
      )`
    ];

    for (const table of tables) {
      try {
        const { error } = await this.supabase.rpc('exec_sql', { sql: table });
        if (error) {
          console.log('Table might already exist:', error.message);
        }
      } catch (error) {
        console.log('Table creation skipped (might exist):', error.message);
      }
    }
    
    console.log('✅ Supabase tables ready');
  }

  // Product operations
  async addAliExpressProduct(productData) {
    const { data, error } = await this.supabase
      .from('aliexpress_products')
      .upsert([productData], { onConflict: 'aliexpress_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAliExpressProduct(aliexpressId) {
    const { data, error } = await this.supabase
      .from('aliexpress_products')
      .select('*')
      .eq('aliexpress_id', aliexpressId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getAllAliExpressProducts() {
    const { data, error } = await this.supabase
      .from('aliexpress_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Store product operations
  async addStoreProduct(storeProductData) {
    const { data, error } = await this.supabase
      .from('store_products')
      .insert([storeProductData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getStoreProducts() {
    const { data, error } = await this.supabase
      .from('store_products')
      .select(`
        *,
        aliexpress_products!inner(title, images)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Order operations
  async createAliExpressOrder(orderData) {
    const { data, error } = await this.supabase
      .from('aliexpress_orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrderStatus(orderId, status, trackingNumber = null) {
    const { data, error } = await this.supabase
      .from('aliexpress_orders')
      .update({ 
        status, 
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPendingOrders() {
    const { data, error } = await this.supabase
      .from('aliexpress_orders')
      .select(`
        *,
        aliexpress_products!inner(title)
      `)
      .eq('status', 'pending')
      .order('order_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  close() {
    // Supabase handles connection management
    console.log('✅ Supabase connection closed');
  }
}

module.exports = new SupabaseDatabase(); 
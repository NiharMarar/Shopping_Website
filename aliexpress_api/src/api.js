const database = require('./database');
const { AliExpressScraper } = require('./scraper');
const AliExpressOrderAutomation = require('./orderAutomation');

// Initialize database
database.init().catch(console.error);

// Export functions for use in index.js
async function getProducts() {
  try {
    const products = await database.getAllAliExpressProducts();
    return products;
  } catch (error) {
    console.error('❌ Get products error:', error);
    throw error;
  }
}

async function importProduct(url) {
  try {
    console.log('📦 Importing product from:', url);
    
    const scraper = new AliExpressScraper();
    await scraper.init();
    
    const productData = await scraper.scrapeProduct(url);
    await scraper.close();
    
    return productData;
  } catch (error) {
    console.error('❌ Product import error:', error);
    throw error;
  }
}

async function createStoreProduct(productData) {
  try {
    const storeProduct = await database.addStoreProduct(productData);
    return storeProduct;
  } catch (error) {
    console.error('❌ Create store product error:', error);
    throw error;
  }
}

async function getStoreProducts() {
  try {
    const products = await database.getStoreProducts();
    return products;
  } catch (error) {
    console.error('❌ Get store products error:', error);
    throw error;
  }
}

async function updateStoreProduct(id, updates) {
  try {
    const product = await database.updateStoreProduct(id, updates);
    return product;
  } catch (error) {
    console.error('❌ Update store product error:', error);
    throw error;
  }
}

async function deleteStoreProduct(id) {
  try {
    const result = await database.deleteStoreProduct(id);
    return result;
  } catch (error) {
    console.error('❌ Delete store product error:', error);
    throw error;
  }
}

module.exports = { 
  getProducts, 
  importProduct, 
  createStoreProduct, 
  getStoreProducts, 
  updateStoreProduct, 
  deleteStoreProduct 
}; 
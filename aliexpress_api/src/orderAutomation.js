const puppeteer = require('puppeteer');
const database = require('./database');

class AliExpressOrderAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
  }

  async init() {
    console.log('🚀 Initializing AliExpress order automation...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Set to true in production
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Order automation initialized');
  }

  async login(email, password) {
    try {
      console.log('🔐 Logging into AliExpress...');
      
      await this.page.goto('https://login.aliexpress.com/', { 
        waitUntil: 'networkidle2' 
      });

      // Wait for login form
      await this.page.waitForSelector('#fm-login-id', { timeout: 10000 });

      // Fill in email
      await this.page.type('#fm-login-id', email);
      
      // Fill in password
      await this.page.type('#fm-login-password', password);
      
      // Click login button
      await this.page.click('.fm-button');
      
      // Wait for login to complete
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Check if login was successful
      const isLoggedIn = await this.page.evaluate(() => {
        return !document.querySelector('#fm-login-id');
      });
      
      if (isLoggedIn) {
        this.isLoggedIn = true;
        console.log('✅ Successfully logged into AliExpress');
      } else {
        throw new Error('Login failed');
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  async placeOrder(productId, quantity, shippingAddress) {
    try {
      if (!this.isLoggedIn) {
        throw new Error('Must be logged in to place orders');
      }

      console.log(`🛒 Placing order for product ${productId}, quantity: ${quantity}`);
      
      // Navigate to product page
      const productUrl = `https://www.aliexpress.com/item/${productId}.html`;
      await this.page.goto(productUrl, { waitUntil: 'networkidle2' });

      // Wait for product page to load
      await this.page.waitForSelector('.product-quantity', { timeout: 10000 });

      // Set quantity
      await this.page.evaluate((qty) => {
        const quantityInput = document.querySelector('.product-quantity input');
        if (quantityInput) {
          quantityInput.value = qty;
          quantityInput.dispatchEvent(new Event('change'));
        }
      }, quantity);

      // Click "Buy Now" button
      await this.page.click('.buy-now-btn');
      
      // Wait for checkout page
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Fill shipping address
      await this.fillShippingAddress(shippingAddress);
      
      // Select payment method (assuming PayPal or credit card)
      await this.selectPaymentMethod();
      
      // Place order
      await this.page.click('.place-order-btn');
      
      // Wait for order confirmation
      await this.page.waitForSelector('.order-confirmation', { timeout: 30000 });
      
      // Extract order details
      const orderDetails = await this.page.evaluate(() => {
        const orderIdElement = document.querySelector('.order-id');
        const orderId = orderIdElement ? orderIdElement.textContent.trim() : '';
        
        const totalElement = document.querySelector('.order-total');
        const total = totalElement ? parseFloat(totalElement.textContent.replace(/[^\d.]/g, '')) : 0;
        
        return {
          aliexpress_order_id: orderId,
          total_price: total
        };
      });
      
      console.log('✅ Order placed successfully:', orderDetails);
      return orderDetails;
      
    } catch (error) {
      console.error('❌ Error placing order:', error);
      throw error;
    }
  }

  async fillShippingAddress(address) {
    try {
      console.log('📦 Filling shipping address...');
      
      // Wait for address form
      await this.page.waitForSelector('#shipping-address-form', { timeout: 10000 });
      
      // Fill address fields
      await this.page.type('#recipient-name', address.name);
      await this.page.type('#phone-number', address.phone);
      await this.page.type('#address-line1', address.line1);
      if (address.line2) {
        await this.page.type('#address-line2', address.line2);
      }
      await this.page.type('#city', address.city);
      await this.page.type('#state', address.state);
      await this.page.type('#postal-code', address.postal_code);
      await this.page.type('#country', address.country);
      
      // Save address
      await this.page.click('#save-address-btn');
      
      console.log('✅ Shipping address filled');
      
    } catch (error) {
      console.error('❌ Error filling shipping address:', error);
      throw error;
    }
  }

  async selectPaymentMethod() {
    try {
      console.log('💳 Selecting payment method...');
      
      // Wait for payment methods to load
      await this.page.waitForSelector('.payment-method', { timeout: 10000 });
      
      // Select PayPal (or your preferred method)
      const paypalOption = await this.page.$('.payment-method[data-method="paypal"]');
      if (paypalOption) {
        await paypalOption.click();
      } else {
        // Select first available payment method
        await this.page.click('.payment-method:first-child');
      }
      
      console.log('✅ Payment method selected');
      
    } catch (error) {
      console.error('❌ Error selecting payment method:', error);
      throw error;
    }
  }

  async processStoreOrder(storeOrderId, aliexpressProductId, quantity, customerAddress) {
    try {
      console.log(`🔄 Processing store order ${storeOrderId} for AliExpress product ${aliexpressProductId}`);
      
      // Get AliExpress product details
      const product = await database.getAliExpressProduct(aliexpressProductId);
      if (!product) {
        throw new Error(`Product ${aliexpressProductId} not found in database`);
      }
      
      // Place order on AliExpress
      const orderResult = await this.placeOrder(
        product.aliexpress_id, 
        quantity, 
        customerAddress
      );
      
      // Save order to database
      const orderData = {
        store_order_id: storeOrderId,
        aliexpress_order_id: orderResult.aliexpress_order_id,
        aliexpress_product_id: aliexpressProductId,
        quantity: quantity,
        total_price: orderResult.total_price,
        status: 'ordered'
      };
      
      await database.createAliExpressOrder(orderData);
      
      console.log('✅ Store order processed successfully');
      return orderResult;
      
    } catch (error) {
      console.error('❌ Error processing store order:', error);
      
      // Save failed order to database
      const failedOrderData = {
        store_order_id: storeOrderId,
        aliexpress_product_id: aliexpressProductId,
        quantity: quantity,
        total_price: 0,
        status: 'failed',
        notes: error.message
      };
      
      await database.createAliExpressOrder(failedOrderData);
      
      throw error;
    }
  }

  async processPendingOrders() {
    try {
      console.log('🔄 Processing pending orders...');
      
      const pendingOrders = await database.getPendingOrders();
      console.log(`📦 Found ${pendingOrders.length} pending orders`);
      
      for (const order of pendingOrders) {
        try {
          console.log(`🔄 Processing order ${order.id}: ${order.product_title}`);
          
          // This would need customer address from your e-commerce system
          const customerAddress = {
            name: 'Customer Name', // Get from your order system
            phone: '1234567890',
            line1: '123 Main St',
            city: 'City',
            state: 'State',
            postal_code: '12345',
            country: 'US'
          };
          
          await this.processStoreOrder(
            order.store_order_id,
            order.aliexpress_product_id,
            order.quantity,
            customerAddress
          );
          
          // Add delay between orders
          await this.delay(5000);
          
        } catch (error) {
          console.error(`❌ Failed to process order ${order.id}:`, error);
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing pending orders:', error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI usage
if (require.main === module) {
  (async () => {
    const automation = new AliExpressOrderAutomation();
    
    try {
      await automation.init();
      
      // Login (you'll need to provide credentials)
      const email = process.env.ALIEXPRESS_EMAIL;
      const password = process.env.ALIEXPRESS_PASSWORD;
      
      if (email && password) {
        await automation.login(email, password);
        
        // Process pending orders
        await automation.processPendingOrders();
      } else {
        console.log('Please set ALIEXPRESS_EMAIL and ALIEXPRESS_PASSWORD environment variables');
      }
      
    } catch (error) {
      console.error('❌ Automation error:', error);
    } finally {
      await automation.close();
    }
  })();
}

module.exports = AliExpressOrderAutomation; 
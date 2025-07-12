const puppeteer = require('puppeteer');
const database = require('./database');

class AliExpressScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🚀 Initializing AliExpress scraper...');
    
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
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Scraper initialized');
  }

  async scrapeProduct(productUrl) {
    try {
      console.log(`🔍 Scraping product: ${productUrl}`);
      
      await this.page.goto(productUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for product page to load
      await this.page.waitForSelector('.product-title', { timeout: 10000 });

      const productData = await this.page.evaluate(() => {
        // Extract product ID from URL
        const urlParts = window.location.href.split('/');
        const aliexpressId = urlParts[urlParts.length - 1].split('.')[0];

        // Extract title
        const titleElement = document.querySelector('.product-title');
        const title = titleElement ? titleElement.textContent.trim() : '';

        // Extract price
        const priceElement = document.querySelector('.product-price-current');
        const priceText = priceElement ? priceElement.textContent.trim() : '';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

        // Extract original price
        const originalPriceElement = document.querySelector('.product-price-original');
        const originalPriceText = originalPriceElement ? originalPriceElement.textContent.trim() : '';
        const originalPrice = parseFloat(originalPriceText.replace(/[^\d.]/g, '')) || price;

        // Extract images
        const imageElements = document.querySelectorAll('.product-image img');
        const images = Array.from(imageElements).map(img => img.src).filter(src => src);

        // Extract seller info
        const sellerElement = document.querySelector('.seller-name');
        const sellerName = sellerElement ? sellerElement.textContent.trim() : '';

        // Extract rating
        const ratingElement = document.querySelector('.seller-rating');
        const rating = ratingElement ? parseFloat(ratingElement.textContent) : 0;

        // Extract stock quantity
        const stockElement = document.querySelector('.stock-quantity');
        const stockQuantity = stockElement ? parseInt(stockElement.textContent) : 999;

        // Extract description
        const descriptionElement = document.querySelector('.product-description');
        const description = descriptionElement ? descriptionElement.textContent.trim() : '';

        // Extract category
        const categoryElement = document.querySelector('.breadcrumb-item:last-child');
        const category = categoryElement ? categoryElement.textContent.trim() : '';

        return {
          aliexpress_id: aliexpressId,
          title,
          description,
          price,
          original_price: originalPrice,
          images,
          seller_name: sellerName,
          seller_rating: rating,
          stock_quantity: stockQuantity,
          category,
          currency: 'USD'
        };
      });

      console.log('📦 Scraped product data:', productData);

      // Save to database
      await database.addAliExpressProduct(productData);
      console.log('✅ Product saved to database');

      return productData;

    } catch (error) {
      console.error('❌ Error scraping product:', error);
      throw error;
    }
  }

  async scrapeMultipleProducts(productUrls) {
    const results = [];
    
    for (const url of productUrls) {
      try {
        const productData = await this.scrapeProduct(url);
        results.push(productData);
        
        // Add delay to avoid being blocked
        await this.delay(2000);
        
      } catch (error) {
        console.error(`❌ Failed to scrape ${url}:`, error);
        results.push({ error: error.message, url });
      }
    }
    
    return results;
  }

  async searchProducts(searchTerm, limit = 10) {
    try {
      console.log(`🔍 Searching for: ${searchTerm}`);
      
      const searchUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(searchTerm)}`;
      await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Wait for search results
      await this.page.waitForSelector('.product-item', { timeout: 10000 });

      const productUrls = await this.page.evaluate((maxResults) => {
        const productElements = document.querySelectorAll('.product-item');
        const urls = [];
        
        for (let i = 0; i < Math.min(productElements.length, maxResults); i++) {
          const linkElement = productElements[i].querySelector('a');
          if (linkElement && linkElement.href) {
            urls.push(linkElement.href);
          }
        }
        
        return urls;
      }, limit);

      console.log(`📦 Found ${productUrls.length} products`);
      return productUrls;

    } catch (error) {
      console.error('❌ Error searching products:', error);
      throw error;
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
    const scraper = new AliExpressScraper();
    
    try {
      await scraper.init();
      
      // Example: Scrape a single product
      const productUrl = process.argv[2];
      if (productUrl) {
        const product = await scraper.scrapeProduct(productUrl);
        console.log('✅ Product scraped:', product);
      } else {
        console.log('Usage: node scraper.js <product_url>');
      }
      
    } catch (error) {
      console.error('❌ Scraper error:', error);
    } finally {
      await scraper.close();
    }
  })();
}

module.exports = AliExpressScraper; 
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
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
    console.log('✅ Scraper initialized');
  }

  async scrapeProduct(productUrl) {
    try {
      console.log(`🔍 Scraping product: ${productUrl}`);
      await this.page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(2000);
      await this.page.screenshot({ path: 'debug-screenshot.png' });
      console.log('📸 Screenshot saved as debug-screenshot.png');

      // Wait for any product content to load
      const titleSelectors = [
        '[data-pl="product-title"]',
        'h1',
        '.product-title',
        '.product-name',
        '[class*="title"]'
      ];
      
      let foundSelector = false;
      for (const selector of titleSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 5000 });
          console.log(`✅ Found product title selector: ${selector}`);
          foundSelector = true;
          break;
        } catch (error) {
          console.log(`⚠️ Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!foundSelector) {
        console.log('⚠️ Could not find any product title selector, continuing anyway...');
      }

      const productData = await this.page.evaluate(() => {
        // Extract product ID from URL
        const urlParts = window.location.href.split('/');
        const aliexpressId = urlParts[urlParts.length - 1].split('.')[0];

        // Title - Multiple selectors for different AliExpress layouts
        let title = '';
        const titleSelectors = [
          '[data-pl="product-title"]',
          'h1',
          '.product-title',
          '.product-name',
          '[class*="title"]',
          '[class*="name"]'
        ];
        
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            title = element.textContent.trim();
            break;
          }
        }

        // Price - Multiple selectors for different price formats
        let price = 0;
        const priceSelectors = [
          '.price--currentPriceText--V8_y_b5',
          '[class*="price"]',
          '.price',
          '.current-price',
          '.product-price',
          '[data-pl="price"]'
        ];
        
        for (const selector of priceSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const priceText = element.textContent.trim();
            const extractedPrice = parseFloat(priceText.replace(/[^\d.]/g, ''));
            if (extractedPrice > 0) {
              price = extractedPrice;
              break;
            }
          }
        }

        // Images - Multiple selectors for different image layouts
        let images = [];
        const imageSelectors = [
          '.magnifier--image--RM17RL2',
          '.product-image img',
          '.main-image img',
          '[class*="image"] img',
          '.gallery img',
          'img[src*="alicdn"]',
          'img[src*="ae01"]'
        ];
        
        for (const selector of imageSelectors) {
          const imageElements = document.querySelectorAll(selector);
          for (const img of imageElements) {
            if (img.src && img.src.includes('alicdn') || img.src.includes('ae01')) {
              images.push(img.src);
            }
          }
          if (images.length > 0) break;
        }

        // Description - Multiple approaches
        let description = '';
        
        // Try description section
        const descSelectors = [
          '#nav-description',
          '.product-description',
          '[class*="description"]',
          '.detail-content'
        ];
        
        for (const selector of descSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            const descText = element.innerText || element.textContent;
            if (descText && descText.trim().length > 10) {
              description = descText.trim();
              break;
            }
          }
        }

        // Fallback: try meta description
        if (!description || description.length < 10) {
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc && metaDesc.content) {
            description = metaDesc.content;
          }
        }

        // Fallback: try to get any text content from the page
        if (!description || description.length < 10) {
          const bodyText = document.body.innerText || document.body.textContent;
          const sentences = bodyText.split(/[.!?]/).slice(0, 3).join('. ');
          if (sentences.length > 20) {
            description = sentences;
          }
        }

        return {
          aliexpress_id: aliexpressId,
          title,
          description,
          price,
          original_price: price,
          images,
          seller_name: '',
          seller_rating: 0,
          stock_quantity: 999,
          category: '',
          currency: 'USD'
        };
      });

      console.log('📦 Scraped product data:', productData);
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

if (require.main === module) {
  (async () => {
    const scraper = new AliExpressScraper();
    try {
      await scraper.init();
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

// Export a simple function for the API
async function scrapeProduct(url) {
  const scraper = new AliExpressScraper();
  try {
    await scraper.init();
    const productData = await scraper.scrapeProduct(url);
    return productData;
  } finally {
    await scraper.close();
  }
}

module.exports = { AliExpressScraper, scrapeProduct }; 
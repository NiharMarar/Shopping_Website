# AliExpress Dropshipping API

A complete dropshipping automation system that integrates with AliExpress to automatically fulfill orders.

## 🎯 Features

- **Product Import**: Scrape and import products from AliExpress
- **Order Automation**: Automatically place orders on AliExpress when customers buy
- **Tracking Sync**: Monitor and sync tracking information
- **Inventory Management**: Track stock levels and pricing
- **Webhook Integration**: Real-time order status updates

## 🏗️ Architecture

```
aliexpress_api/
├── src/
│   ├── scraper.js          # Product data scraping
│   ├── orderAutomation.js  # Order placement automation
│   ├── tracking.js         # Tracking number sync
│   ├── database.js         # Local database operations
│   └── api.js             # Express API endpoints
├── tests/
├── docs/
└── data/
    └── products.db        # SQLite database
```

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your AliExpress credentials
   ```

3. **Run the System**
   ```bash
   npm run dev
   ```

## 📋 Workflow

1. **Product Import**: Scrape AliExpress products and store in database
2. **Customer Order**: Customer buys from your e-commerce site
3. **Auto Order**: System automatically orders from AliExpress
4. **Tracking Sync**: Monitor AliExpress order and update customer

## 🔧 Configuration

- `ALIEXPRESS_EMAIL`: Your AliExpress account email
- `ALIEXPRESS_PASSWORD`: Your AliExpress password
- `MARKUP_PERCENTAGE`: Profit margin percentage
- `WEBHOOK_URL`: Your e-commerce webhook endpoint

## ⚠️ Important Notes

- This system requires AliExpress account credentials
- Respect AliExpress terms of service
- Implement rate limiting to avoid being blocked
- Handle failed orders and refunds properly
- Monitor for price changes and stock availability

## 📝 TODO

- [ ] Product scraping functionality
- [ ] Order automation system
- [ ] Tracking number sync
- [ ] Database schema design
- [ ] API endpoints for e-commerce integration
- [ ] Error handling and retry logic
- [ ] Monitoring and logging 
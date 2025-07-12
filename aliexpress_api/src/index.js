require('dotenv').config();
const express = require('express');
const path = require('path');
const { getProducts, importProduct, createStoreProduct, getStoreProducts, updateStoreProduct, deleteStoreProduct } = require('./api');
const { scrapeProduct } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve test.html directly
app.get('/test.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'test.html'));
});

// API Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/import', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log('Importing product from:', url);
        const product = await importProduct(url);
        res.json(product);
    } catch (error) {
        console.error('Error importing product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/scrape', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log('Scraping product from:', url);
        const scrapedData = await scrapeProduct(url);
        res.json(scrapedData);
    } catch (error) {
        console.error('Error scraping product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Store Products Management
app.post('/api/store/products', async (req, res) => {
    try {
        const productData = req.body;
        const product = await createStoreProduct(productData);
        res.json(product);
    } catch (error) {
        console.error('Error creating store product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/store/products', async (req, res) => {
    try {
        const products = await getStoreProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching store products:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/store/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const product = await updateStoreProduct(id, updates);
        res.json(product);
    } catch (error) {
        console.error('Error updating store product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/store/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteStoreProduct(id);
        res.json(result);
    } catch (error) {
        console.error('Error deleting store product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test UI available at http://localhost:${PORT}/test.html`);
}); 
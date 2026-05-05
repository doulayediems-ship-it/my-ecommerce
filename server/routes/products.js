const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  const { query, category } = req.query;
  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (query) {
      sql += ' AND name ILIKE $' + (params.length + 1);
      params.push(`%${query}%`);
    }
    if (category) {
      sql += ' AND category = $' + (params.length + 1);
      params.push(category);
    }
    
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;

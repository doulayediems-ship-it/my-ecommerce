const express = require('express');
const pool = require('../db/pool');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Add product (Admin only)
router.post('/products', authenticate, authorize(['admin']), async (req, res) => {
  const { name, description, price, stock, image_url, category } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, stock, image_url, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add product' });
  }
});

// Update product (Admin only)
router.put('/products/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { name, description, price, stock, image_url, category } = req.body;

  try {
    const result = await pool.query(
      'UPDATE products SET name=$1, description=$2, price=$3, stock=$4, image_url=$5, category=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *',
      [name, description, price, stock, image_url, category, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

// Get dashboard stats (Admin only)
router.get('/stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const totalOrders = await pool.query('SELECT COUNT(*) FROM orders');
    const totalRevenue = await pool.query('SELECT SUM(total_amount) FROM orders');
    const totalProducts = await pool.query('SELECT COUNT(*) FROM products');
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');

    res.json({
      totalOrders: parseInt(totalOrders.rows[0].count),
      totalRevenue: totalRevenue.rows[0].sum || 0,
      totalProducts: parseInt(totalProducts.rows[0].count),
      totalUsers: parseInt(totalUsers.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;

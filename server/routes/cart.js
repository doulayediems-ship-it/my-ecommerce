const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// In-memory cart storage (use Redis in production)
const carts = {};

// Get cart
router.get('/', authenticate, (req, res) => {
  const userId = req.user.id;
  res.json(carts[userId] || { items: [], total: 0 });
});

// Add to cart
router.post('/add', authenticate, (req, res) => {
  const { product_id, quantity, price } = req.body;
  const userId = req.user.id;

  if (!carts[userId]) {
    carts[userId] = { items: [], total: 0 };
  }

  const existingItem = carts[userId].items.find(item => item.product_id === product_id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    carts[userId].items.push({ product_id, quantity, price });
  }

  carts[userId].total = carts[userId].items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  res.json(carts[userId]);
});

// Remove from cart
router.post('/remove', authenticate, (req, res) => {
  const { product_id } = req.body;
  const userId = req.user.id;

  if (carts[userId]) {
    carts[userId].items = carts[userId].items.filter(item => item.product_id !== product_id);
    carts[userId].total = carts[userId].items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  res.json(carts[userId]);
});

// Clear cart
router.post('/clear', authenticate, (req, res) => {
  const userId = req.user.id;
  delete carts[userId];
  res.json({ items: [], total: 0 });
});

module.exports = router;

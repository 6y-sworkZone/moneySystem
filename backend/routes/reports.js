const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/monthly-summary', (req, res) => {
  const { year, month } = req.query;
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  db.all(`
    SELECT 
      type,
      SUM(amount) as total
    FROM transactions
    WHERE date >= ? AND date <= ?
    GROUP BY type
  `, [startDate, endDate], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/category-breakdown', (req, res) => {
  const { year, month } = req.query;
  const startDate = `${year}-${month}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  db.all(`
    SELECT 
      category,
      SUM(amount) as total
    FROM transactions
    WHERE date >= ? AND date <= ? AND type = 'expense'
    GROUP BY category
    ORDER BY total DESC
  `, [startDate, endDate], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/yearly-trend', (req, res) => {
  const { year } = req.query;

  db.all(`
    SELECT 
      strftime('%m', date) as month,
      type,
      SUM(amount) as total
    FROM transactions
    WHERE strftime('%Y', date) = ?
    GROUP BY month, type
    ORDER BY month
  `, [year], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/net-worth', (req, res) => {
  db.all(`
    SELECT 
      type,
      SUM(balance) as total
    FROM accounts
    GROUP BY type
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/account-balances', (req, res) => {
  db.all(`
    SELECT 
      id,
      name,
      type,
      balance
    FROM accounts
    ORDER BY type, balance DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

module.exports = router;

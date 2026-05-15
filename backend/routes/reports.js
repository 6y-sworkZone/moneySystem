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

router.get('/net-worth-trend', (req, res) => {
  const { year } = req.query;
  
  db.get(`
    SELECT 
      SUM(balance) as totalBalance
    FROM accounts
  `, [], (balanceErr, balanceRow) => {
    if (balanceErr) {
      res.status(500).json({ error: balanceErr.message });
      return;
    }

    db.all(`
      SELECT 
        strftime('%Y-%m', date) as month,
        type,
        SUM(amount) as total
      FROM transactions
      WHERE strftime('%Y', date) = ?
      GROUP BY month, type
      ORDER BY month DESC
    `, [year], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentMonthKey = `${currentYear}-${currentMonth}`;
      
      let currentNetWorth = balanceRow?.totalBalance || 0;
      
      const monthKeys = [];
      for (let i = 12; i >= 1; i--) {
        monthKeys.push(`${year}-${String(i).padStart(2, '0')}`);
      }
      
      const trendMap = {};
      
      let netWorth = currentNetWorth;
      monthKeys.forEach(month => {
        trendMap[month] = netWorth;
        
        if (month >= currentMonthKey && year == currentYear) {
          return;
        }
        
        const income = rows.find(r => r.month === month && r.type === 'income')?.total || 0;
        const expense = rows.find(r => r.month === month && r.type === 'expense')?.total || 0;
        netWorth -= (income - expense);
      });
      
      const trend = [];
      for (let i = 1; i <= 12; i++) {
        const month = `${year}-${String(i).padStart(2, '0')}`;
        trend.push({
          month,
          netWorth: parseFloat((trendMap[month] || 0).toFixed(2))
        });
      }
      
      res.json(trend);
    });
  });
});

module.exports = router;

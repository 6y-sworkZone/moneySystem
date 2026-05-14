const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const { month } = req.query;
  db.all('SELECT * FROM budgets WHERE month = ? ORDER BY amount DESC', [month], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/comparison', (req, res) => {
  const { month } = req.query;
  const [year, mon] = month.split('-');
  const startDate = `${year}-${mon}-01`;
  const endDate = new Date(year, mon, 0).toISOString().split('T')[0];

  db.all(`
    SELECT 
      b.category,
      b.amount as budget,
      COALESCE(SUM(t.amount), 0) as actual
    FROM budgets b
    LEFT JOIN transactions t ON t.category = b.category AND t.type = 'expense' 
      AND t.date >= ? AND t.date <= ?
    WHERE b.month = ?
    GROUP BY b.category
  `, [startDate, endDate, month], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { category, amount, month } = req.body;
  const stmt = db.prepare('INSERT OR REPLACE INTO budgets (category, amount, month) VALUES (?, ?, ?)');
  stmt.run(category, amount, month, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, category, amount, month });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM budgets WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '预算删除成功' });
  });
});

module.exports = router;

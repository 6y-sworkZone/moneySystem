const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  db.all(`
    SELECT i.*, a.name as account_name 
    FROM investments i 
    LEFT JOIN accounts a ON i.account_id = a.id 
    ORDER BY i.purchase_date DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { account_id, name, symbol, quantity, purchase_price, current_price, purchase_date } = req.body;
  const stmt = db.prepare('INSERT INTO investments (account_id, name, symbol, quantity, purchase_price, current_price, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(account_id, name, symbol, quantity, purchase_price, current_price || purchase_price, purchase_date, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, account_id, name, symbol, quantity, purchase_price, current_price, purchase_date });
  });
});

router.put('/:id', (req, res) => {
  const { account_id, name, symbol, quantity, purchase_price, current_price, purchase_date } = req.body;
  const stmt = db.prepare('UPDATE investments SET account_id = ?, name = ?, symbol = ?, quantity = ?, purchase_price = ?, current_price = ?, purchase_date = ? WHERE id = ?');
  stmt.run(account_id, name, symbol, quantity, purchase_price, current_price, purchase_date, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, account_id, name, symbol, quantity, purchase_price, current_price, purchase_date });
  });
});

router.patch('/:id/current-price', (req, res) => {
  const { current_price } = req.body;
  const stmt = db.prepare('UPDATE investments SET current_price = ? WHERE id = ?');
  stmt.run(current_price, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, current_price });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM investments WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '投资记录删除成功' });
  });
});

module.exports = router;

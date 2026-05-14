const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM accounts ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM accounts WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { name, type, balance, currency, color, description } = req.body;
  const stmt = db.prepare('INSERT INTO accounts (name, type, balance, currency, color, description) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(name, type, balance || 0, currency || 'CNY', color, description, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name, type, balance, currency, color, description });
  });
});

router.put('/:id', (req, res) => {
  const { name, type, balance, currency, color, description } = req.body;
  const stmt = db.prepare('UPDATE accounts SET name = ?, type = ?, balance = ?, currency = ?, color = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(name, type, balance, currency, color, description, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, name, type, balance, currency, color, description });
  });
});

router.patch('/:id/balance', (req, res) => {
  const { balance } = req.body;
  const stmt = db.prepare('UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(balance, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, balance });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM accounts WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '账户删除成功' });
  });
});

module.exports = router;

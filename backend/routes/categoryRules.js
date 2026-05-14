const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM category_rules ORDER BY priority DESC, created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { keyword, category, priority } = req.body;
  const stmt = db.prepare('INSERT INTO category_rules (keyword, category, priority) VALUES (?, ?, ?)');
  stmt.run(keyword, category, priority || 0, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, keyword, category, priority });
  });
});

router.put('/:id', (req, res) => {
  const { keyword, category, priority } = req.body;
  const stmt = db.prepare('UPDATE category_rules SET keyword = ?, category = ?, priority = ? WHERE id = ?');
  stmt.run(keyword, category, priority, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, keyword, category, priority });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM category_rules WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '规则删除成功' });
  });
});

module.exports = router;

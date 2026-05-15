const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

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

router.post('/import-balances', upload.single('file'), (req, res) => {
  const results = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let updated = 0;
      let errors = [];
      
      const processNext = (index) => {
        if (index >= results.length) {
          fs.unlinkSync(req.file.path);
          res.json({ updated, errors, total: results.length });
          return;
        }
        
        const row = results[index];
        const id = row.id || row.account_id || row.账户ID;
        const balance = parseFloat(row.balance || row.余额 || row.balance);
        
        if (!id || isNaN(balance)) {
          errors.push(`第${index + 1}行数据无效`);
          processNext(index + 1);
          return;
        }
        
        db.run('UPDATE accounts SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [balance, id], function(err) {
          if (err) {
            errors.push(`账户ID ${id} 更新失败: ${err.message}`);
          } else if (this.changes > 0) {
            updated++;
          } else {
            errors.push(`账户ID ${id} 不存在`);
          }
          processNext(index + 1);
        });
      };
      
      processNext(0);
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database/db');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

router.get('/', (req, res) => {
  const { account_id, start_date, end_date, category } = req.query;
  let query = `
    SELECT t.*, a.name as account_name 
    FROM transactions t 
    LEFT JOIN accounts a ON t.account_id = a.id 
    WHERE 1=1
  `;
  let params = [];

  if (account_id) {
    query += ' AND t.account_id = ?';
    params.push(account_id);
  }
  if (start_date) {
    query += ' AND t.date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND t.date <= ?';
    params.push(end_date);
  }
  if (category) {
    query += ' AND t.category = ?';
    params.push(category);
  }
  query += ' ORDER BY t.date DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM transactions WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

function matchCategory(text, callback) {
  db.all('SELECT * FROM category_rules ORDER BY priority DESC', (err, rules) => {
    if (err) {
      callback(null);
      return;
    }
    for (const rule of rules) {
      if (text && text.includes(rule.keyword)) {
        callback(rule.category);
        return;
      }
    }
    callback('支出-其他');
  });
}

router.post('/', (req, res) => {
  const { account_id, type, amount, category, merchant, tags, note, date } = req.body;
  
  const finalize = (cat) => {
    const stmt = db.prepare('INSERT INTO transactions (account_id, type, amount, category, merchant, tags, note, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(account_id, type, amount, cat || category, merchant, tags, note, date, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const balanceChange = type === 'income' ? amount : -amount;
      db.run('UPDATE accounts SET balance = balance + ? WHERE id = ?', [balanceChange, account_id], (updateErr) => {
        if (updateErr) {
          console.error('更新账户余额失败:', updateErr);
        }
      });
      
      res.json({ id: this.lastID, account_id, type, amount, category: cat || category, merchant, tags, note, date });
    });
  };

  if (!category && merchant) {
    matchCategory(merchant, finalize);
  } else {
    finalize(category);
  }
});

router.put('/:id', (req, res) => {
  const { account_id, type, amount, category, merchant, tags, note, date } = req.body;
  const stmt = db.prepare('UPDATE transactions SET account_id = ?, type = ?, amount = ?, category = ?, merchant = ?, tags = ?, note = ?, date = ? WHERE id = ?');
  stmt.run(account_id, type, amount, category, merchant, tags, note, date, req.params.id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: req.params.id, account_id, type, amount, category, merchant, tags, note, date });
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM transactions WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '交易记录删除成功' });
  });
});

router.post('/import', upload.single('file'), (req, res) => {
  const results = [];
  const account_id = req.body.account_id;
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let imported = 0;
      const processNext = (index) => {
        if (index >= results.length) {
          fs.unlinkSync(req.file.path);
          res.json({ imported, total: results.length });
          return;
        }
        
        const row = results[index];
        const amount = parseFloat(row.amount || row.金额);
        const type = amount >= 0 ? 'income' : 'expense';
        const merchant = row.merchant || row.商户 || '';
        const date = row.date || row.日期 || new Date().toISOString();
        
        matchCategory(merchant, (category) => {
          const stmt = db.prepare('INSERT INTO transactions (account_id, type, amount, category, merchant, date) VALUES (?, ?, ?, ?, ?, ?)');
          stmt.run(account_id, type, Math.abs(amount), category, merchant, date, function(err) {
            if (!err) {
              imported++;
            }
            processNext(index + 1);
          });
        });
      };
      processNext(0);
    });
});

module.exports = router;

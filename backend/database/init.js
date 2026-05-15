const db = require('./db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'CNY',
    color TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    merchant TEXT,
    tags TEXT,
    note TEXT,
    date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS category_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    category TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount REAL NOT NULL,
    month TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, month)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS monthly_budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    month TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT,
    quantity REAL NOT NULL,
    purchase_price REAL NOT NULL,
    current_price REAL,
    purchase_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  )`);

  const defaultCategories = [
    { keyword: '工资', category: '收入-工资', priority: 10 },
    { keyword: '奖金', category: '收入-奖金', priority: 10 },
    { keyword: '外卖', category: '支出-餐饮', priority: 5 },
    { keyword: '超市', category: '支出-购物', priority: 5 },
    { keyword: '加油', category: '支出-交通', priority: 5 },
    { keyword: '地铁', category: '支出-交通', priority: 5 },
    { keyword: '电影', category: '支出-娱乐', priority: 5 },
    { keyword: '话费', category: '支出-通讯', priority: 5 },
    { keyword: '房租', category: '支出-住房', priority: 5 },
    { keyword: '水电', category: '支出-住房', priority: 5 }
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO category_rules (keyword, category, priority) VALUES (?, ?, ?)');
  defaultCategories.forEach(rule => {
    stmt.run(rule.keyword, rule.category, rule.priority);
  });
  stmt.finalize();

  console.log('数据库初始化完成');
});

db.close();

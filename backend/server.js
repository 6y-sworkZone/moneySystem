const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('uploads目录已创建');
}

const accountsRouter = require('./routes/accounts');
const transactionsRouter = require('./routes/transactions');
const categoryRulesRouter = require('./routes/categoryRules');
const reportsRouter = require('./routes/reports');
const budgetsRouter = require('./routes/budgets');
const investmentsRouter = require('./routes/investments');

const app = express();
const PORT = 4523;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/accounts', accountsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/category-rules', categoryRulesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/investments', investmentsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '财务分析平台后端运行正常' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

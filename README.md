# 个人财务分析平台

一个功能完整的个人财务管理系统，使用 React + Node.js(Express) + SQLite 技术栈。

## 功能特性

### 1. 账户管理
- 支持现金、银行卡、信用卡、投资账户等多种类型
- 手动更新余额
- 各账户余额汇总展示

### 2. 交易记录
- 手动录入收入/支出记录
- CSV导入自动解析
- 商户标签和备注
- 按账户、日期筛选

### 3. 分类规则
- 关键词自动匹配分类
- 支持规则优先级设置
- 默认规则预设

### 4. 统计报表
- 月度收支对比柱状图
- 年度趋势折线图
- 分类占比环形图
- ECharts 可视化渲染

### 5. 资产负债总览
- 各账户余额汇总
- 信用卡负债统计
- 净值计算和趋势展示

### 6. 预算管理
- 月度总预算设置
- 分类预算管理
- 实际支出 vs 预算对比
- 进度条可视化

### 7. 投资追踪
- 投资持仓记录
- 实时收益率计算
- 成本与市值对比

## 技术栈

**后端:**
- Node.js
- Express.js
- SQLite3
- Multer (文件上传)
- csv-parser (CSV解析)

**前端:**
- React 18
- React Router DOM
- ECharts / echarts-for-react
- Axios
- Vite (构建工具)

## 项目结构

```
moneySystem/
├── backend/
│   ├── database/
│   │   ├── db.js          # 数据库连接
│   │   └── init.js        # 数据库初始化脚本
│   ├── routes/
│   │   ├── accounts.js    # 账户管理API
│   │   ├── transactions.js # 交易记录API
│   │   ├── categoryRules.js # 分类规则API
│   │   ├── reports.js     # 统计报表API
│   │   ├── budgets.js     # 预算管理API
│   │   └── investments.js # 投资追踪API
│   ├── server.js          # 服务器入口
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 快速开始

### 前置条件
- Node.js >= 16
- npm 或 yarn

### 1. 安装后端依赖并初始化数据库

```bash
cd backend
npm install
npm run init-db
```

### 2. 启动后端服务器

```bash
npm start
```

后端服务将运行在 http://localhost:4523

### 3. 安装前端依赖

```bash
cd ../frontend
npm install
```

### 4. 启动前端开发服务器

```bash
npm run dev
```

前端服务将运行在 http://localhost:3857

### 开发模式

如需开发时自动重启后端服务：

```bash
cd backend
npm run dev
```

## API 端点

### 账户管理
- `GET /api/accounts` - 获取所有账户
- `GET /api/accounts/:id` - 获取单个账户
- `POST /api/accounts` - 创建账户
- `PUT /api/accounts/:id` - 更新账户
- `PATCH /api/accounts/:id/balance` - 更新余额
- `DELETE /api/accounts/:id` - 删除账户

### 交易记录
- `GET /api/transactions` - 获取交易记录（支持筛选）
- `POST /api/transactions` - 创建交易记录
- `POST /api/transactions/import` - 导入CSV文件
- `PUT /api/transactions/:id` - 更新交易记录
- `DELETE /api/transactions/:id` - 删除交易记录

### 分类规则
- `GET /api/category-rules` - 获取所有规则
- `POST /api/category-rules` - 创建规则
- `PUT /api/category-rules/:id` - 更新规则
- `DELETE /api/category-rules/:id` - 删除规则

### 统计报表
- `GET /api/reports/monthly-summary` - 月度收支汇总
- `GET /api/reports/category-breakdown` - 分类支出明细
- `GET /api/reports/yearly-trend` - 年度趋势数据
- `GET /api/reports/net-worth` - 净值统计
- `GET /api/reports/account-balances` - 账户余额列表

### 预算管理
- `GET /api/budgets` - 获取预算列表
- `GET /api/budgets/comparison` - 预算与实际对比
- `POST /api/budgets` - 创建/更新预算
- `DELETE /api/budgets/:id` - 删除预算

### 投资追踪
- `GET /api/investments` - 获取持仓列表
- `POST /api/investments` - 创建持仓
- `PUT /api/investments/:id` - 更新持仓
- `PATCH /api/investments/:id/current-price` - 更新现价
- `DELETE /api/investments/:id` - 删除持仓

## 使用说明

1. 首次使用时，建议先创建账户（现金、银行卡、信用卡等）
2. 添加分类规则以便在录入交易时自动分类
3. 可以手动录入交易记录，或通过CSV批量导入
4. 设置月度预算，追踪支出情况
5. 记录投资持仓，实时追踪收益变化
6. 通过统计报表查看财务趋势和分析

## CSV导入格式

支持以下列名（中文或英文）：
- date / 日期
- amount / 金额（正数为收入，负数为支出）
- merchant / 商户
- category / 分类

## 注意事项

- 数据库文件位于 `backend/database/finance.db`
- 上传的CSV文件会自动处理，处理后会被删除
- 建议定期备份数据库文件

## 许可证

MIT

import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Transactions from './pages/Transactions'
import CategoryRules from './pages/CategoryRules'
import Reports from './pages/Reports'
import Budgets from './pages/Budgets'
import Investments from './pages/Investments'

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <h2>💰 财务分析</h2>
          <nav>
            <NavLink to="/">概览</NavLink>
            <NavLink to="/accounts">账户管理</NavLink>
            <NavLink to="/transactions">交易记录</NavLink>
            <NavLink to="/category-rules">分类规则</NavLink>
            <NavLink to="/reports">统计报表</NavLink>
            <NavLink to="/budgets">预算管理</NavLink>
            <NavLink to="/investments">投资追踪</NavLink>
          </nav>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/category-rules" element={<CategoryRules />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/investments" element={<Investments />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

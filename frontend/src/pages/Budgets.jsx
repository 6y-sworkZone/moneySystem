import React, { useState, useEffect } from 'react'
import { budgetsAPI } from '../services/api'

const categories = [
  '支出-餐饮', '支出-购物', '支出-交通', '支出-娱乐',
  '支出-通讯', '支出-住房', '支出-医疗', '支出-教育', '支出-其他'
]

function Budgets() {
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  
  const [month, setMonth] = useState(currentMonth)
  const [budgets, setBudgets] = useState([])
  const [comparison, setComparison] = useState([])
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showMonthlyModal, setShowMonthlyModal] = useState(false)
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState('')
  const [formData, setFormData] = useState({ category: '', amount: '' })

  useEffect(() => {
    loadBudgets()
  }, [month])

  const loadBudgets = async () => {
    try {
      const [budgetsRes, comparisonRes, monthlyRes] = await Promise.all([
        budgetsAPI.getAll(month),
        budgetsAPI.getComparison(month),
        budgetsAPI.getMonthlyBudget(month),
      ])
      setBudgets(budgetsRes.data)
      setComparison(comparisonRes.data)
      setMonthlyBudget(monthlyRes.data.amount || 0)
    } catch (error) {
      console.error('加载预算失败:', error)
    }
  }

  const handleMonthlyBudgetSubmit = async (e) => {
    e.preventDefault()
    try {
      await budgetsAPI.setMonthlyBudget(parseFloat(monthlyBudgetInput), month)
      setMonthlyBudget(parseFloat(monthlyBudgetInput))
      setShowMonthlyModal(false)
    } catch (error) {
      console.error('保存月度总预算失败:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await budgetsAPI.create({ ...formData, month })
      loadBudgets()
      setShowModal(false)
      setFormData({ category: '', amount: '' })
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个预算吗？')) {
      try {
        await budgetsAPI.delete(id)
        loadBudgets()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }

  const totalCategoryBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalActual = comparison.reduce((sum, c) => sum + c.actual, 0)
  const totalBudget = monthlyBudget || totalCategoryBudget
  const remaining = totalBudget - totalActual

  return (
    <div>
      <div className="page-header">
        <h1>🎯 预算管理</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date()
              d.setMonth(d.getMonth() - i)
              const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
              return <option key={m} value={m}>{m}</option>
            })}
          </select>
          <button className="btn" onClick={() => { setMonthlyBudgetInput(String(monthlyBudget)); setShowMonthlyModal(true); }}>设置月度总预算</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ 分类预算</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">月度总预算</div>
          <div className="value" style={{ color: '#722ed1' }}>¥{monthlyBudget.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">已分配分类预算</div>
          <div className="value" style={{ color: '#1890ff' }}>¥{totalCategoryBudget.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">已支出</div>
          <div className="value" style={{ color: '#fa8c16' }}>¥{totalActual.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">剩余预算</div>
          <div className="value" style={{ color: remaining >= 0 ? '#52c41a' : '#ff4d4f' }}>¥{remaining.toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>📊 分类预算对比</h3>
        <table className="table">
          <thead>
            <tr>
              <th>分类</th>
              <th>预算金额</th>
              <th>实际支出</th>
              <th>剩余</th>
              <th>进度</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map(c => {
              const remainingCat = c.budget - c.actual
              const progress = c.budget > 0 ? (c.actual / c.budget) * 100 : 0
              const progressClass = progress >= 100 ? 'danger' : progress >= 80 ? 'warning' : ''
              return (
                <tr key={c.category}>
                  <td>{c.category}</td>
                  <td>¥{c.budget.toFixed(2)}</td>
                  <td>¥{c.actual.toFixed(2)}</td>
                  <td style={{ color: remainingCat >= 0 ? '#52c41a' : '#ff4d4f' }}>¥{remainingCat.toFixed(2)}</td>
                  <td style={{ width: '200px' }}>
                    <div className="progress-bar">
                      <div className={`fill ${progressClass}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#666' }}>{progress.toFixed(1)}%</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(budgets.find(b => b.category === c.category)?.id)}>删除</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>💡 预算使用建议</h3>
        <ul style={{ color: '#666', lineHeight: '2' }}>
          {remaining < 0 && <li>⚠️ 本月预算已超支 ¥{Math.abs(remaining).toFixed(2)}，请控制支出</li>}
          {remaining >= 0 && remaining < totalBudget * 0.2 && <li>⚡ 本月预算已使用80%以上，请注意控制</li>}
          {remaining >= totalBudget * 0.5 && <li>✅ 本月预算使用情况良好，继续保持！</li>}
          {totalBudget === 0 && <li>💡 还没有设置本月预算，点击右上角开始设置吧</li>}
        </ul>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>设置分类预算</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>分类</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">请选择</option>
                    {categories.filter(c => !budgets.find(b => b.category === c)).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>预算金额</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMonthlyModal && (
        <div className="modal-overlay" onClick={() => setShowMonthlyModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>设置月度总预算</h3>
              <button className="modal-close" onClick={() => setShowMonthlyModal(false)}>×</button>
            </div>
            <form onSubmit={handleMonthlyBudgetSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>月度总预算金额</label>
                  <input type="number" step="0.01" value={monthlyBudgetInput} onChange={e => setMonthlyBudgetInput(e.target.value)} required />
                </div>
                {totalCategoryBudget > 0 && totalCategoryBudget > parseFloat(monthlyBudgetInput || 0) && (
                  <div style={{ background: '#fff1f0', padding: '12px', borderRadius: '4px', color: '#ff4d4f', fontSize: '12px' }}>
                    ⚠️ 注意：已分配的分类预算总和（¥{totalCategoryBudget.toFixed(2)}）大于您设置的月度总预算
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowMonthlyModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Budgets

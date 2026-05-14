import React, { useState, useEffect } from 'react'
import { investmentsAPI, accountsAPI } from '../services/api'

function Investments() {
  const [investments, setInvestments] = useState([])
  const [accounts, setAccounts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState(null)
  const [formData, setFormData] = useState({
    account_id: '', name: '', symbol: '', quantity: '', purchase_price: '', current_price: '', purchase_date: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [invRes, accountsRes] = await Promise.all([
        investmentsAPI.getAll(),
        accountsAPI.getAll(),
      ])
      setInvestments(invRes.data)
      setAccounts(accountsRes.data.filter(a => a.type === 'investment'))
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingInvestment) {
        await investmentsAPI.update(editingInvestment.id, formData)
      } else {
        await investmentsAPI.create(formData)
      }
      loadData()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleEdit = (investment) => {
    setEditingInvestment(investment)
    setFormData(investment)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条持仓吗？')) {
      try {
        await investmentsAPI.delete(id)
        loadData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingInvestment(null)
    setFormData({
      account_id: '', name: '', symbol: '', quantity: '', purchase_price: '', current_price: '', purchase_date: new Date().toISOString().split('T')[0]
    })
  }

  const totalCost = investments.reduce((sum, i) => sum + i.quantity * i.purchase_price, 0)
  const totalValue = investments.reduce((sum, i) => sum + i.quantity * (i.current_price || i.purchase_price), 0)
  const totalProfit = totalValue - totalCost
  const profitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return (
    <div>
      <div className="page-header">
        <h1>📈 投资追踪</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ 添加持仓</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">总投入</div>
          <div className="value" style={{ color: '#1890ff' }}>¥{totalCost.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">当前市值</div>
          <div className="value" style={{ color: '#722ed1' }}>¥{totalValue.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">总收益</div>
          <div className="value" style={{ color: totalProfit >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {totalProfit >= 0 ? '+' : ''}¥{totalProfit.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="label">收益率</div>
          <div className="value" style={{ color: profitRate >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>代码</th>
              <th>持仓数量</th>
              <th>买入价格</th>
              <th>当前价格</th>
              <th>持仓成本</th>
              <th>当前市值</th>
              <th>收益</th>
              <th>收益率</th>
              <th>买入日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {investments.map(i => {
              const cost = i.quantity * i.purchase_price
              const value = i.quantity * (i.current_price || i.purchase_price)
              const profit = value - cost
              const rate = cost > 0 ? (profit / cost) * 100 : 0
              return (
                <tr key={i.id}>
                  <td><strong>{i.name}</strong></td>
                  <td><code>{i.symbol || '-'}</code></td>
                  <td>{i.quantity}</td>
                  <td>¥{i.purchase_price.toFixed(2)}</td>
                  <td>¥{(i.current_price || i.purchase_price).toFixed(2)}</td>
                  <td>¥{cost.toFixed(2)}</td>
                  <td>¥{value.toFixed(2)}</td>
                  <td style={{ color: profit >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {profit >= 0 ? '+' : ''}¥{profit.toFixed(2)}
                  </td>
                  <td style={{ color: rate >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {rate >= 0 ? '+' : ''}{rate.toFixed(2)}%
                  </td>
                  <td>{i.purchase_date}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }} onClick={() => handleEdit(i)}>编辑</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(i.id)}>删除</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>💡 投资建议</h3>
        <ul style={{ color: '#666', lineHeight: '2' }}>
          {totalProfit < 0 && <li>⚠️ 当前处于亏损状态，请评估持仓是否需要调整</li>}
          {totalProfit >= 0 && totalProfit < totalCost * 0.1 && <li>📊 微盈利状态，继续观察走势</li>}
          {totalProfit >= totalCost * 0.1 && <li>✅ 收益良好，考虑止盈或继续持有</li>}
          {investments.length === 0 && <li>💡 还没有添加持仓，点击右上角开始记录你的投资吧</li>}
        </ul>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingInvestment ? '编辑持仓' : '添加持仓'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>投资账户</label>
                  <select value={formData.account_id} onChange={e => setFormData({ ...formData, account_id: e.target.value })} required>
                    <option value="">请选择账户</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>投资名称</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>代码（可选）</label>
                    <input type="text" value={formData.symbol} onChange={e => setFormData({ ...formData, symbol: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>持仓数量</label>
                    <input type="number" step="0.01" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })} required />
                  </div>
                  <div className="form-group">
                    <label>买入价格</label>
                    <input type="number" step="0.01" value={formData.purchase_price} onChange={e => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>当前价格</label>
                    <input type="number" step="0.01" value={formData.current_price} onChange={e => setFormData({ ...formData, current_price: parseFloat(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label>买入日期</label>
                    <input type="date" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} required />
                  </div>
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
    </div>
  )
}

export default Investments

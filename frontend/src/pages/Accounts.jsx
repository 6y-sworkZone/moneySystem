import React, { useState, useEffect } from 'react'
import { accountsAPI } from '../services/api'

const accountTypes = [
  { value: 'cash', label: '现金', color: '#52c41a' },
  { value: 'bank', label: '银行卡', color: '#1890ff' },
  { value: 'credit', label: '信用卡', color: '#ff4d4f' },
  { value: 'investment', label: '投资账户', color: '#722ed1' },
]

function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [formData, setFormData] = useState({
    name: '', type: 'cash', balance: 0, currency: 'CNY', color: '', description: ''
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      const res = await accountsAPI.getAll()
      setAccounts(res.data)
    } catch (error) {
      console.error('加载账户失败:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAccount) {
        await accountsAPI.update(editingAccount.id, formData)
      } else {
        await accountsAPI.create(formData)
      }
      loadAccounts()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setFormData(account)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个账户吗？')) {
      try {
        await accountsAPI.delete(id)
        loadAccounts()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingAccount(null)
    setFormData({ name: '', type: 'cash', balance: 0, currency: 'CNY', color: '', description: '' })
  }

  const getTypeColor = (type) => {
    return accountTypes.find(t => t.value === type)?.color || '#999'
  }

  const getTypeLabel = (type) => {
    return accountTypes.find(t => t.value === type)?.label || type
  }

  return (
    <div>
      <div className="page-header">
        <h1>💳 账户管理</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + 添加账户
        </button>
      </div>

      <div className="account-list">
        {accounts.map(account => (
          <div key={account.id} className="account-card" style={{ borderLeftColor: getTypeColor(account.type) }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <span className="tag" style={{ background: getTypeColor(account.type) + '20', color: getTypeColor(account.type) }}>
                  {getTypeLabel(account.type)}
                </span>
              </div>
            </div>
            <h3>{account.name}</h3>
            <div className="balance" style={{ color: account.balance >= 0 ? '#333' : '#ff4d4f' }}>
              ¥{account.balance.toFixed(2)}
            </div>
            {account.description && <p style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>{account.description}</p>}
            <div className="actions">
              <button className="btn btn-sm btn-primary" onClick={() => handleEdit(account)}>编辑</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(account.id)}>删除</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAccount ? '编辑账户' : '添加账户'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>账户名称</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>账户类型</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      {accountTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>余额</label>
                    <input type="number" step="0.01" value={formData.balance} onChange={e => setFormData({ ...formData, balance: parseFloat(e.target.value) })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>描述</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" />
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

export default Accounts

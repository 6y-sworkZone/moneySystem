import React, { useState, useEffect } from 'react'
import { transactionsAPI, accountsAPI } from '../services/api'

const categories = [
  '收入-工资', '收入-奖金', '收入-其他',
  '支出-餐饮', '支出-购物', '支出-交通', '支出-娱乐',
  '支出-通讯', '支出-住房', '支出-医疗', '支出-教育', '支出-其他'
]

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState('')
  const [filters, setFilters] = useState({ account_id: '', start_date: '', end_date: '' })
  const [formData, setFormData] = useState({
    account_id: '', type: 'expense', amount: '', category: '', merchant: '', note: '', date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [filters])

  const loadData = async () => {
    try {
      const [transRes, accountsRes] = await Promise.all([
        transactionsAPI.getAll(),
        accountsAPI.getAll(),
      ])
      setTransactions(transRes.data)
      setAccounts(accountsRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const res = await transactionsAPI.getAll(filters)
      setTransactions(res.data)
    } catch (error) {
      console.error('加载交易记录失败:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTransaction) {
        await transactionsAPI.update(editingTransaction.id, formData)
      } else {
        await transactionsAPI.create(formData)
      }
      loadData()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleImport = async (e) => {
    e.preventDefault()
    if (!importFile || !selectedAccount) {
      alert('请选择文件和账户')
      return
    }
    const formData = new FormData()
    formData.append('file', importFile)
    formData.append('account_id', selectedAccount)
    try {
      await transactionsAPI.import(formData)
      loadData()
      setShowImportModal(false)
      setImportFile(null)
      setSelectedAccount('')
    } catch (error) {
      console.error('导入失败:', error)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData(transaction)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await transactionsAPI.delete(id)
        loadData()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingTransaction(null)
    setFormData({
      account_id: '', type: 'expense', amount: '', category: '', merchant: '', note: '', date: new Date().toISOString().split('T')[0]
    })
  }

  return (
    <div>
      <div className="page-header">
        <h1>📝 交易记录</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => setShowImportModal(true)}>📁 导入CSV</button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ 添加记录</button>
        </div>
      </div>

      <div className="card">
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>账户筛选</label>
            <select value={filters.account_id} onChange={e => setFilters({ ...filters, account_id: e.target.value })}>
              <option value="">全部账户</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>开始日期</label>
            <input type="date" value={filters.start_date} onChange={e => setFilters({ ...filters, start_date: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>结束日期</label>
            <input type="date" value={filters.end_date} onChange={e => setFilters({ ...filters, end_date: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>账户</th>
              <th>类型</th>
              <th>金额</th>
              <th>分类</th>
              <th>商户</th>
              <th>备注</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>{t.account_name || '-'}</td>
                <td><span className={`tag tag-${t.type}`}>{t.type === 'income' ? '收入' : '支出'}</span></td>
                <td style={{ color: t.type === 'income' ? '#52c41a' : '#fa8c16' }}>
                  {t.type === 'income' ? '+' : '-'}¥{parseFloat(t.amount).toFixed(2)}
                </td>
                <td>{t.category}</td>
                <td>{t.merchant || '-'}</td>
                <td>{t.note || '-'}</td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }} onClick={() => handleEdit(t)}>编辑</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTransaction ? '编辑记录' : '添加记录'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>日期</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>账户</label>
                    <select value={formData.account_id} onChange={e => setFormData({ ...formData, account_id: e.target.value })} required>
                      <option value="">请选择</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>类型</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      <option value="expense">支出</option>
                      <option value="income">收入</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>金额</label>
                    <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>分类</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="">请选择</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>商户</label>
                  <input type="text" value={formData.merchant} onChange={e => setFormData({ ...formData, merchant: e.target.value })} placeholder="输入商户名可自动匹配分类" />
                </div>
                <div className="form-group">
                  <label>备注</label>
                  <textarea value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} rows="2" />
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

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>导入CSV</h3>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>×</button>
            </div>
            <form onSubmit={handleImport}>
              <div className="modal-body">
                <div className="form-group">
                  <label>选择账户</label>
                  <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} required>
                    <option value="">请选择</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>选择CSV文件</label>
                  <input type="file" accept=".csv" onChange={e => setImportFile(e.target.files[0])} required />
                </div>
                <p style={{ fontSize: '12px', color: '#666' }}>CSV格式：date, amount, merchant, category（支持中文列名）</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowImportModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">导入</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions

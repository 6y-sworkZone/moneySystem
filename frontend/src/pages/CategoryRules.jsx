import React, { useState, useEffect } from 'react'
import { categoryRulesAPI } from '../services/api'

const categories = [
  '收入-工资', '收入-奖金', '收入-其他',
  '支出-餐饮', '支出-购物', '支出-交通', '支出-娱乐',
  '支出-通讯', '支出-住房', '支出-医疗', '支出-教育', '支出-其他'
]

function CategoryRules() {
  const [rules, setRules] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [formData, setFormData] = useState({ keyword: '', category: '', priority: 0 })

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const res = await categoryRulesAPI.getAll()
      setRules(res.data)
    } catch (error) {
      console.error('加载规则失败:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRule) {
        await categoryRulesAPI.update(editingRule.id, formData)
      } else {
        await categoryRulesAPI.create(formData)
      }
      loadRules()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData(rule)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条规则吗？')) {
      try {
        await categoryRulesAPI.delete(id)
        loadRules()
      } catch (error) {
        console.error('删除失败:', error)
      }
    }
  }

  const resetForm = () => {
    setEditingRule(null)
    setFormData({ keyword: '', category: '', priority: 0 })
  }

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ 分类规则</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ 添加规则</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>关键词</th>
              <th>分类</th>
              <th>优先级</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.id}>
                <td><code>{rule.keyword}</code></td>
                <td>{rule.category}</td>
                <td><span className="tag">{rule.priority}</span></td>
                <td>
                  <button className="btn btn-sm btn-primary" style={{ marginRight: '5px' }} onClick={() => handleEdit(rule)}>编辑</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(rule.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>💡 规则说明</h3>
        <ul style={{ color: '#666', lineHeight: '2' }}>
          <li>当交易记录的商户名称包含关键词时，会自动匹配到对应的分类</li>
          <li>优先级越高的规则越先匹配，数字越大优先级越高</li>
          <li>如果商户名称匹配不到任何规则，将使用默认分类</li>
        </ul>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRule ? '编辑规则' : '添加规则'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>关键词</label>
                  <input type="text" value={formData.keyword} onChange={e => setFormData({ ...formData, keyword: e.target.value })} placeholder="例如：美团、滴滴" required />
                </div>
                <div className="form-group">
                  <label>分类</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">请选择</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>优先级</label>
                  <input type="number" value={formData.priority} onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })} min="0" />
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

export default CategoryRules

import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { reportsAPI } from '../services/api'

function Reports() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'))
  const [monthlySummary, setMonthlySummary] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [yearlyTrend, setYearlyTrend] = useState([])
  const [accountBalances, setAccountBalances] = useState([])

  useEffect(() => {
    loadData()
  }, [year, month])

  const loadData = async () => {
    try {
      const [summaryRes, categoryRes, trendRes, accountsRes] = await Promise.all([
        reportsAPI.getMonthlySummary(year, month),
        reportsAPI.getCategoryBreakdown(year, month),
        reportsAPI.getYearlyTrend(year),
        reportsAPI.getAccountBalances(),
      ])
      setMonthlySummary(summaryRes.data)
      setCategoryBreakdown(categoryRes.data)
      setYearlyTrend(trendRes.data)
      setAccountBalances(accountsRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const totalIncome = monthlySummary.find(s => s.type === 'income')?.total || 0
  const totalExpense = monthlySummary.find(s => s.type === 'expense')?.total || 0
  const balance = totalIncome - totalExpense

  const monthlyTrendData = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0')
    const income = yearlyTrend.find(t => t.month === m && t.type === 'income')?.total || 0
    const expense = yearlyTrend.find(t => t.month === m && t.type === 'expense')?.total || 0
    return { month: m, income, expense }
  })

  const pieOption = {
    title: { text: '支出分类占比', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: categoryBreakdown.map(c => ({ value: c.total, name: c.category })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }

  const barOption = {
    title: { text: '月度收支对比', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], bottom: '5%' },
    xAxis: { type: 'category', data: monthlyTrendData.map(d => d.month + '月') },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'bar', data: monthlyTrendData.map(d => d.income), itemStyle: { color: '#52c41a' } },
      { name: '支出', type: 'bar', data: monthlyTrendData.map(d => d.expense), itemStyle: { color: '#fa8c16' } }
    ]
  }

  const lineOption = {
    title: { text: '年度趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出', '结余'], bottom: '5%' },
    xAxis: { type: 'category', data: monthlyTrendData.map(d => d.month + '月') },
    yAxis: { type: 'value' },
    series: [
      { name: '收入', type: 'line', data: monthlyTrendData.map(d => d.income), itemStyle: { color: '#52c41a' } },
      { name: '支出', type: 'line', data: monthlyTrendData.map(d => d.expense), itemStyle: { color: '#fa8c16' } },
      { name: '结余', type: 'line', data: monthlyTrendData.map(d => d.income - d.expense), itemStyle: { color: '#1890ff' } }
    ]
  }

  return (
    <div>
      <div className="page-header">
        <h1>📈 统计报表</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
              <option key={m} value={m}>{m}月</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">{month}月收入</div>
          <div className="value" style={{ color: '#52c41a' }}>¥{totalIncome.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">{month}月支出</div>
          <div className="value" style={{ color: '#fa8c16' }}>¥{totalExpense.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">{month}月结余</div>
          <div className="value" style={{ color: balance >= 0 ? '#1890ff' : '#ff4d4f' }}>¥{balance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">月均支出</div>
          <div className="value" style={{ color: '#722ed1' }}>¥{(totalExpense / parseInt(month)).toFixed(2)}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="chart-container">
          <ReactECharts option={barOption} style={{ height: '100%' }} />
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <div className="chart-container">
            <ReactECharts option={pieOption} style={{ height: '100%' }} />
          </div>
        </div>
        <div className="card">
          <div className="chart-container">
            <ReactECharts option={lineOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>💰 分类支出明细</h3>
        <table className="table">
          <thead>
            <tr>
              <th>分类</th>
              <th>金额</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            {categoryBreakdown.map(c => (
              <tr key={c.category}>
                <td>{c.category}</td>
                <td>¥{c.total.toFixed(2)}</td>
                <td>{totalExpense > 0 ? ((c.total / totalExpense) * 100).toFixed(1) + '%' : '0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports

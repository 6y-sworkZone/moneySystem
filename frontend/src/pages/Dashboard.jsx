import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { reportsAPI } from '../services/api'

function Dashboard() {
  const [summary, setSummary] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [netWorth, setNetWorth] = useState([])
  const [accountBalances, setAccountBalances] = useState([])
  const [netWorthTrend, setNetWorthTrend] = useState([])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [summaryRes, categoryRes, netWorthRes, accountsRes, trendRes] = await Promise.all([
        reportsAPI.getMonthlySummary(currentYear, currentMonth),
        reportsAPI.getCategoryBreakdown(currentYear, currentMonth),
        reportsAPI.getNetWorth(),
        reportsAPI.getAccountBalances(),
        reportsAPI.getNetWorthTrend(currentYear),
      ])
      setSummary(summaryRes.data)
      setCategoryBreakdown(categoryRes.data)
      setNetWorth(netWorthRes.data)
      setAccountBalances(accountsRes.data)
      setNetWorthTrend(trendRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const totalIncome = summary.find(s => s.type === 'income')?.total || 0
  const totalExpense = summary.find(s => s.type === 'expense')?.total || 0
  const balance = totalIncome - totalExpense

  const getTotalByType = (type) => {
    return netWorth.filter(n => 
      (type === 'asset' && ['cash', 'bank', 'investment'].includes(n.type)) ||
      (type === 'liability' && n.type === 'credit')
    ).reduce((sum, n) => sum + n.total, 0)
  }

  const totalAssets = getTotalByType('asset')
  const totalLiabilities = Math.abs(getTotalByType('liability'))
  const netWorthValue = totalAssets - totalLiabilities

  const pieOption = {
    title: { text: '支出分类', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { bottom: '5%', left: 'center' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: categoryBreakdown.map(c => ({ value: c.total, name: c.category })),
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  }

  const accountPieOption = {
    title: { text: '资产分布', left: 'center' },
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '60%',
      data: accountBalances.filter(a => a.balance > 0).map(a => ({ value: a.balance, name: a.name })),
    }]
  }

  const netWorthTrendOption = {
    title: { text: '净值趋势', left: 'center' },
    tooltip: { trigger: 'axis', formatter: '{b}: ¥{c}' },
    xAxis: { type: 'category', data: netWorthTrend.map(d => d.month.split('-')[1] + '月') },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: netWorthTrend.map(d => d.netWorth),
      smooth: true,
      areaStyle: { opacity: 0.3 },
      itemStyle: { color: '#722ed1' },
      lineStyle: { color: '#722ed1' }
    }]
  }

  return (
    <div>
      <div className="page-header">
        <h1>📊 财务概览</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">本月收入</div>
          <div className="value" style={{ color: '#52c41a' }}>¥{totalIncome.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">本月支出</div>
          <div className="value" style={{ color: '#fa8c16' }}>¥{totalExpense.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">本月结余</div>
          <div className="value" style={{ color: balance >= 0 ? '#1890ff' : '#ff4d4f' }}>¥{balance.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">净值</div>
          <div className="value" style={{ color: '#722ed1' }}>¥{netWorthValue.toFixed(2)}</div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">总资产</div>
          <div className="value" style={{ color: '#1890ff' }}>¥{totalAssets.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="label">总负债</div>
          <div className="value" style={{ color: '#ff4d4f' }}>¥{totalLiabilities.toFixed(2)}</div>
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
            <ReactECharts option={accountPieOption} style={{ height: '100%' }} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="chart-container">
          <ReactECharts option={netWorthTrendOption} style={{ height: '100%' }} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

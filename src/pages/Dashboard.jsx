import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Plus } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../useAuth.js'
import { byUser, dateLabel, getErrorMessage, money, monthKey } from '../api.js'
import { ButtonLink, CategoryBadge, EmptyState, ErrorBanner, LoadingState, SummaryCard } from '../components/Common.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({ transactions: [], categories: [], budgets: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [today] = useState(() => new Date())
  const currentMonth = monthKey(today)

  useEffect(() => {
    Promise.all([byUser('transactions', user.id), byUser('categories', user.id), byUser('budgets', user.id)])
      .then(([transactions, categories, budgets]) => setData({ transactions, categories, budgets }))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false))
  }, [user.id])

  const currentTransactions = useMemo(
    () => data.transactions.filter((item) => item.date?.startsWith(currentMonth)),
    [data.transactions, currentMonth],
  )
  const totals = currentTransactions.reduce((sum, item) => {
    sum[item.type] += Number(item.amount)
    return sum
  }, { income: 0, expense: 0 })
  const recent = [...data.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const categorySpending = data.categories.map((category) => ({
    name: category.name,
    value: currentTransactions.filter((item) => item.type === 'expense' && String(item.categoryId) === String(category.id))
      .reduce((sum, item) => sum + Number(item.amount), 0),
    color: category.color,
  })).filter((item) => item.value > 0)
  const budgetTotal = data.budgets.filter((item) => item.month === currentMonth).reduce((sum, item) => sum + Number(item.amount), 0)
  const budgetPercent = budgetTotal ? Math.min((totals.expense / budgetTotal) * 100, 100) : 0
  const trend = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)
    const key = monthKey(date)
    return {
      month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date),
      income: data.transactions.filter((item) => item.date.startsWith(key) && item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0),
      expenses: data.transactions.filter((item) => item.date.startsWith(key) && item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0),
    }
  }), [today, data.transactions])

  if (loading) return <LoadingState />

  return (
    <div className="dashboard-page">
      <div className="welcome-row">
        <div><p className="welcome-date"><CalendarDays size={15} /> {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(today)}</p><h2>Que bom ver você, {user.name.split(' ')[0]}.</h2><p>Veja como suas finanças estão neste mês.</p></div>
        <ButtonLink to="/transactions/new">Adicionar transação</ButtonLink>
      </div>
      <ErrorBanner message={error} />
      <div className="summary-grid">
        <SummaryCard label="Total de receitas" value={totals.income} kind="income" note="Neste mês" />
        <SummaryCard label="Total de despesas" value={totals.expense} kind="expense" note="Neste mês" />
        <SummaryCard label="Saldo disponível" value={totals.income - totals.expense} kind="balance" note="Receitas menos despesas" />
      </div>
      <div className="dashboard-grid">
        <section className="panel recent-panel">
          <div className="panel-heading"><div><span className="eyebrow">SUA MOVIMENTAÇÃO</span><h3>Transações recentes</h3></div><Link to="/transactions" className="text-link">Ver todas <ArrowRight size={15} /></Link></div>
          {recent.length ? <div className="transaction-list">
            {recent.map((item) => {
              const category = data.categories.find((entry) => String(entry.id) === String(item.categoryId))
              return <div className="transaction-row" key={item.id}><span className={`transaction-symbol ${item.type}`}>{item.type === 'income' ? '↙' : '↗'}</span><div className="transaction-main"><strong>{item.description}</strong><span><CategoryBadge category={category} /> <i className="row-dot">·</i> {dateLabel(item.date)}</span></div><strong className={`transaction-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{money(item.amount)}</strong></div>
            })}
          </div> : <EmptyState title="Nenhuma movimentação ainda" description="Adicione uma transação para começar a acompanhar suas finanças." action={<ButtonLink to="/transactions/new">Adicionar transação</ButtonLink>} />}
        </section>
        <section className="panel budget-panel">
          <div className="panel-heading"><div><span className="eyebrow">PLANO DO MÊS</span><h3>Resumo do orçamento</h3></div><Link to="/budgets" className="text-link">Gerenciar <ArrowRight size={15} /></Link></div>
          <div className="budget-numbers"><strong>{money(totals.expense)}</strong><span>de {money(budgetTotal)} planejados</span></div>
          <div className={`progress-track ${budgetPercent >= 100 ? 'over' : budgetPercent >= 80 ? 'warning' : ''}`}><span style={{ width: `${budgetPercent}%` }} /></div>
          <div className="progress-caption"><span>{budgetTotal ? `${Math.round((totals.expense / budgetTotal) * 100)}% utilizado` : 'Nenhum orçamento definido'}</span><span>{money(Math.max(budgetTotal - totals.expense, 0))} restantes</span></div>
          <div className="budget-tip">{budgetPercent >= 100 ? 'Você atingiu o limite do orçamento mensal. Revise seu planejamento.' : budgetPercent >= 80 ? 'Você está chegando perto do limite mensal.' : 'Tudo em ordem. Continue assim!'}</div>
          <Link className="budget-link" to="/budgets"><Plus size={15} /> Ajustar orçamentos mensais</Link>
        </section>
      </div>
      <section className="panel spending-panel">
        <div className="panel-heading"><div><span className="eyebrow">DIVISÃO DAS DESPESAS</span><h3>Para onde vai seu dinheiro</h3></div><span className="period-pill">Neste mês</span></div>
        {categorySpending.length ? <div className="chart-layout">
          <div className="donut-wrap"><ResponsiveContainer width="100%" height={230}><PieChart><Pie data={categorySpending} dataKey="value" nameKey="name" innerRadius={66} outerRadius={94} paddingAngle={4} stroke="none">{categorySpending.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => money(value)} contentStyle={{ background: '#222', border: '1px solid #393939', borderRadius: 10, color: '#f5f5f5' }} /><Legend /></PieChart></ResponsiveContainer></div>
          <div className="spending-list">{[...categorySpending].sort((a, b) => b.value - a.value).slice(0, 5).map((item) => <div key={item.name} className="spending-item"><span><i style={{ backgroundColor: item.color }} />{item.name}</span><strong>{money(item.value)}</strong></div>)}</div>
        </div> : <EmptyState title="Seu gráfico está esperando" description="Quando você adicionar despesas, suas categorias aparecerão aqui." action={<Link className="text-link" to="/transactions/new">Adicionar a primeira despesa <ArrowRight size={15} /></Link>} />}
      </section>
      <section className="panel trend-panel">
        <div className="panel-heading"><div><span className="eyebrow">FLUXO FINANCEIRO</span><h3>Receitas e despesas</h3></div><span className="period-pill">Últimos 6 meses</span></div>
        <div className="trend-chart"><ResponsiveContainer width="100%" height={250}><BarChart data={trend} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}><CartesianGrid stroke="#343434" vertical={false} /><XAxis dataKey="month" tick={{ fill: '#8a8a8a', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#8a8a8a', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$ ${value >= 1000 ? `${(value / 1000).toFixed(0)} mil` : value}`} /><Tooltip formatter={(value) => money(value)} contentStyle={{ background: '#222', border: '1px solid #393939', borderRadius: 10, color: '#f5f5f5' }} /><Legend /><Bar dataKey="income" name="Receitas" fill="#27865B" radius={[4, 4, 0, 0]} maxBarSize={24} /><Bar dataKey="expenses" name="Despesas" fill="#C5A45D" radius={[4, 4, 0, 0]} maxBarSize={24} /></BarChart></ResponsiveContainer></div>
      </section>
    </div>
  )
}

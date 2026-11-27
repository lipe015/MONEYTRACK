import { useEffect, useMemo, useState } from 'react'
import { Coins, Pencil, Plus } from 'lucide-react'
import { useAuth } from '../useAuth.js'
import { api, byUser, getErrorMessage, money, monthKey } from '../api.js'
import { EmptyState, ErrorBanner, LoadingState, PageIntro } from '../components/Common.jsx'

export default function Budgets() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [month, setMonth] = useState(monthKey())
  const [amounts, setAmounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([byUser('categories', user.id), byUser('budgets', user.id), byUser('transactions', user.id)])
      .then(([tags, plans, items]) => { setCategories(tags); setBudgets(plans); setTransactions(items) })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false))
  }, [user.id])

  const monthBudgets = useMemo(() => budgets.filter((item) => item.month === month), [budgets, month])
  const rows = useMemo(() => categories.map((category) => {
    const budget = monthBudgets.find((item) => String(item.categoryId) === String(category.id))
    const spent = transactions.filter((item) => item.type === 'expense' && item.date.startsWith(month) && String(item.categoryId) === String(category.id))
      .reduce((sum, item) => sum + Number(item.amount), 0)
    return { category, budget, spent, amount: Number(budget?.amount || 0) }
  }), [categories, monthBudgets, transactions, month])

  async function save(categoryId) {
    const amount = Number(amounts[categoryId])
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Informe um valor de orçamento maior que zero.')
      return
    }
    const existing = monthBudgets.find((item) => String(item.categoryId) === String(categoryId))
    const payload = { amount, month, categoryId, userId: user.id }
    try {
      const saved = existing
        ? await api(`budgets/${encodeURIComponent(existing.id)}`, { method: 'PATCH', body: payload })
        : await api('budgets', { method: 'POST', body: payload })
      setBudgets((items) => existing ? items.map((item) => item.id === existing.id ? saved : item) : [...items, saved])
      setAmounts((items) => ({ ...items, [categoryId]: '' }))
      setError('')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  const planned = monthBudgets.reduce((sum, item) => sum + Number(item.amount), 0)
  const spentTotal = rows.reduce((sum, row) => sum + row.spent, 0)
  const [year, monthNumber] = month.split('-').map(Number)
  const monthLabel = `${['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][monthNumber - 1]} de ${year}`

  return <div>
    <PageIntro title="Orçamentos mensais" description="Defina um limite confortável para cada categoria de despesas." action={<label className="month-picker"><span>Planear para</span><input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>} />
    <ErrorBanner message={error} />
    <div className="budget-summary panel"><div className="budget-summary-icon"><Coins size={20} /></div><div><span>{monthLabel}</span><strong>{money(spentTotal)} <small>em despesas</small></strong></div><div className="budget-summary-divider" /><div><span>Total planeado</span><strong>{money(planned)}</strong></div><div className="budget-summary-right">{planned > 0 ? `${Math.round(spentTotal / planned * 100)}% do limite utilizado` : 'Ainda sem orçamento'}</div></div>
    {loading ? <LoadingState /> : rows.length ? <div className="budget-cards">{rows.map(({ category, budget, spent, amount }) => {
      const percent = amount ? spent / amount * 100 : 0
      const state = percent >= 100 ? 'over' : percent >= 80 ? 'warning' : ''
      return <article className={`panel budget-card ${state}`} key={category.id}>
        <div className="budget-card-heading"><span className="category-color" style={{ backgroundColor: category.color }} /><div><strong>{category.name}</strong><span>{budget ? 'Orçamento mensal da categoria' : 'Nenhum orçamento definido'}</span></div>{budget && <button className="icon-button" type="button" aria-label={`Editar orçamento de ${category.name}`} onClick={() => setAmounts((items) => ({ ...items, [category.id]: String(amount) }))}><Pencil size={15} /></button>}</div>
        <div className="budget-card-numbers"><strong>{money(spent)} <small>em despesas</small></strong><span>{budget ? `de ${money(amount)}` : 'Defina um limite abaixo'}</span></div>
        {budget && <><div className={`progress-track ${state}`}><span style={{ width: `${Math.min(percent, 100)}%` }} /></div><div className="progress-caption"><span>{Math.round(percent)}% utilizado</span><span className={state}>{percent >= 100 ? `${money(spent - amount)} acima do limite` : `${money(amount - spent)} restantes`}</span></div></>}
        <div className="budget-edit-row"><label className="sr-only" htmlFor={`budget-${category.id}`}>Valor do orçamento de {category.name}</label><span>€</span><input id={`budget-${category.id}`} type="number" min="0.01" step="0.01" placeholder={budget ? String(amount) : 'Defina o limite mensal'} value={amounts[category.id] ?? ''} onChange={(e) => setAmounts((items) => ({ ...items, [category.id]: e.target.value }))} /><button type="button" className="button button-small" onClick={() => save(category.id)}>{budget ? 'Atualizar' : <><Plus size={14} /> Definir limite</>}</button></div>
        {state === 'over' && <p className="budget-state-note over">O limite desta categoria foi ultrapassado. Reveja o seu planeamento.</p>}
        {state === 'warning' && <p className="budget-state-note warning">Está perto do limite — acompanhe as suas despesas.</p>}
      </article>
    })}</div> : <EmptyState title="Crie categorias primeiro" description="Adicione algumas categorias de despesas para planear o seu orçamento mensal." />}
  </div>
}

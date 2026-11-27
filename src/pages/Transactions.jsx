import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Search, Trash2 } from 'lucide-react'
import { useAuth } from '../useAuth.js'
import { api, byUser, dateLabel, getErrorMessage, money } from '../api.js'
import { ButtonLink, CategoryBadge, EmptyState, ErrorBanner, LoadingState, PageIntro } from '../components/Common.jsx'

export default function Transactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ search: '', type: 'all', category: 'all', month: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([byUser('transactions', user.id), byUser('categories', user.id)])
      .then(([items, tags]) => {
        if (!active) return
        setTransactions(items.sort((a, b) => b.date.localeCompare(a.date)))
        setCategories(tags)
        setError('')
      })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id])

  const filtered = useMemo(() => transactions.filter((item) => {
    return item.description.toLowerCase().includes(filters.search.toLowerCase())
      && (filters.type === 'all' || item.type === filters.type)
      && (filters.category === 'all' || String(item.categoryId) === filters.category)
      && (!filters.month || item.date.startsWith(filters.month))
  }), [transactions, filters])

  async function remove(item) {
    if (!window.confirm(`Excluir “${item.description}”? Esta ação não pode ser desfeita.`)) return
    try {
      await api(`transactions/${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      setTransactions((current) => current.filter((entry) => entry.id !== item.id))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return (
    <div>
      <PageIntro title="Todas as transações" description="Pesquise e consulte todos os seus rendimentos e despesas." action={<ButtonLink to="/transactions/new">Adicionar transação</ButtonLink>} />
      <ErrorBanner message={error} />
      <div className="filter-bar">
        <label className="search-field"><Search size={16} /><input aria-label="Pesquisar descrição" placeholder="Pesquisar descrições..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></label>
        <select aria-label="Filtrar por tipo" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="all">Todos os tipos</option><option value="income">Rendimento</option><option value="expense">Despesa</option></select>
        <select aria-label="Filtrar por categoria" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="all">Todas as categorias</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <input aria-label="Filtrar por mês" type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
      </div>
      {loading ? <LoadingState /> : filtered.length ? <div className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Tipo</th><th className="align-right">Valor</th><th aria-label="Ações" /></tr></thead><tbody>
        {filtered.map((item) => {
          const category = categories.find((entry) => String(entry.id) === String(item.categoryId))
          return <tr key={item.id}><td><strong className="table-description">{item.description}</strong></td><td><CategoryBadge category={category} /></td><td>{dateLabel(item.date)}</td><td><span className={`type-label ${item.type}`}>{item.type === 'income' ? 'rendimento' : 'despesa'}</span></td><td className={`align-right table-amount ${item.type}`}>{item.type === 'income' ? '+' : '−'}{money(item.amount)}</td><td><div className="row-actions"><Link to={`/transactions/${item.id}/edit`} className="icon-button" aria-label={`Editar ${item.description}`}><Pencil size={15} /></Link><button type="button" className="icon-button danger" aria-label={`Eliminar ${item.description}`} onClick={() => remove(item)}><Trash2 size={15} /></button></div></td></tr>
        })}
      </tbody></table></div><div className="table-footer">{filtered.length} {filtered.length === 1 ? 'transação encontrada' : 'transações encontradas'}</div></div> : <EmptyState title="Nenhuma transação encontrada" description={transactions.length ? 'Tente ajustar os filtros.' : 'Adicione sua primeira transação para vê-la aqui.'} action={<ButtonLink to="/transactions/new">Adicionar transação</ButtonLink>} />}
    </div>
  )
}

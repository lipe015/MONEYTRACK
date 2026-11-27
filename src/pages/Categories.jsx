import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../useAuth.js'
import { api, byUser, getErrorMessage } from '../api.js'
import { EmptyState, ErrorBanner, LoadingState, PageIntro } from '../components/Common.jsx'

const colors = ['#C5A45D', '#27865B', '#6F8CC3', '#D69A36', '#A879B8', '#C94C4C']

export default function Categories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name: '', color: colors[0] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    byUser('categories', user.id)
      .then((items) => { if (active) setCategories(items) })
      .catch((requestError) => { if (active) setError(getErrorMessage(requestError)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [user.id])

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (categories.some((item) => item.name.toLowerCase() === form.name.trim().toLowerCase())) {
      setError('Já existe uma categoria com esse nome.')
      return
    }
    try {
      const created = await api('categories', { method: 'POST', body: { ...form, name: form.name.trim(), userId: user.id } })
      setCategories((items) => [...items, created])
      setForm({ name: '', color: colors[(categories.length + 1) % colors.length] })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  async function remove(category) {
    try {
      const [transactions, budgets] = await Promise.all([byUser('transactions', user.id), byUser('budgets', user.id)])
      if (transactions.some((item) => String(item.categoryId) === String(category.id)) || budgets.some((item) => String(item.categoryId) === String(category.id))) {
        setError('Esta categoria está vinculada a uma transação ou orçamento. Remova os vínculos antes de excluí-la.')
        return
      }
      if (!window.confirm(`Excluir a categoria “${category.name}”?`)) return
      await api(`categories/${encodeURIComponent(category.id)}`, { method: 'DELETE' })
      setCategories((items) => items.filter((item) => item.id !== category.id))
      setError('')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return <div>
    <PageIntro title="Suas categorias" description="Organize suas despesas para entender melhor seus hábitos." />
    <ErrorBanner message={error} />
    <div className="settings-grid">
      <section className="panel settings-panel"><span className="eyebrow">NOVA CATEGORIA</span><h3>Crie uma categoria</h3><form className="form-stack compact-form" onSubmit={submit}>
        <label>Nome da categoria<input required maxLength="36" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Viagem" /></label>
        <label>Cor<select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>{colors.map((color) => <option key={color} value={color}>{color}</option>)}</select></label>
        <button className="button">Adicionar categoria</button>
      </form></section>
      <section className="panel category-panel"><div className="panel-heading"><div><span className="eyebrow">ORGANIZAÇÃO</span><h3>Categorias</h3></div><span className="period-pill">{categories.length} no total</span></div>
        {loading ? <LoadingState /> : categories.length ? <div className="category-grid">{categories.map((category) => <div className="category-card" key={category.id}><span className="category-color" style={{ backgroundColor: category.color }} /><strong>{category.name}</strong><button className="icon-button danger" type="button" aria-label={`Excluir ${category.name}`} onClick={() => remove(category)}><Trash2 size={15} /></button></div>)}</div> : <EmptyState title="Nenhuma categoria ainda" description="Adicione uma categoria para organizar suas finanças." />}
      </section>
    </div>
  </div>
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../useAuth.js'
import { api, byUser, getErrorMessage } from '../api.js'
import { ErrorBanner, LoadingState } from '../components/Common.jsx'

const emptyForm = () => ({ description: '', amount: '', type: 'expense', categoryId: '', date: new Date().toISOString().slice(0, 10) })

export default function TransactionForm() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(editing)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([byUser('categories', user.id), editing ? byUser('transactions', user.id) : Promise.resolve([])])
      .then(([tags, transactions]) => {
        setCategories(tags)
        const found = transactions.find((item) => String(item.id) === String(id))
        if (editing && !found) setError('Esta transação não foi encontrada na sua conta.')
        if (found) setForm({ description: found.description, amount: String(found.amount), type: found.type, categoryId: String(found.categoryId || ''), date: found.date })
      })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false))
  }, [user.id, id, editing])

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) return setError('Informe um valor maior que zero.')
    setBusy(true)
    const payload = { ...form, description: form.description.trim(), amount: Number(form.amount), userId: user.id, categoryId: form.categoryId || null }
    try {
      if (editing) await api(`transactions/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })
      else await api('transactions', { method: 'POST', body: payload })
      navigate('/transactions')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingState />

  return <div className="form-page">
    <Link to="/transactions" className="back-link"><ArrowLeft size={16} /> Voltar às transações</Link>
    <div className="form-card"><span className="eyebrow">{editing ? 'ATUALIZE O LANÇAMENTO' : 'REGISTE UM LANÇAMENTO'}</span><h2>{editing ? 'Editar transação' : 'Adicionar transação'}</h2><p className="form-description">Preencha os detalhes para manter o seu resumo financeiro atualizado.</p>
      <ErrorBanner message={error} />
      <form className="form-stack" onSubmit={submit}>
        <label>Descrição<input required maxLength="80" autoFocus value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex.: compras da semana" /></label>
        <div className="form-two-col">
          <label>Valor (€)<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" /></label>
          <label>Data<input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
        </div>
        <label>Tipo de transação<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="expense">Despesa</option><option value="income">Rendimento</option></select></label>
        <label>Categoria<select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        {categories.length === 0 && <p className="field-note">Ainda não tem categorias. Adicione uma na página Categorias.</p>}
        <div className="form-actions"><Link to="/transactions" className="button button-secondary">Cancelar</Link><button className="button" disabled={busy || (editing && Boolean(error))}>{busy ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar transação'}</button></div>
      </form>
    </div>
  </div>
}

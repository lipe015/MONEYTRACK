import { useState } from 'react'
import { Check, UserRound } from 'lucide-react'
import { useAuth } from '../useAuth.js'
import { api, getErrorMessage } from '../api.js'
import { ErrorBanner } from '../components/Common.jsx'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: user.name, email: user.email })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      const email = form.email.trim().toLowerCase()
      const matches = await api(`users?email=${encodeURIComponent(email)}`)
      if (matches.some((item) => String(item.id) !== String(user.id))) throw new Error('Já existe uma conta com este e-mail.')
      await updateProfile({ name: form.name.trim(), email })
      setSuccess('Seu perfil foi atualizado.')
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return <div className="profile-page">
    <div className="profile-card panel">
      <div className="profile-heading"><span className="profile-icon"><UserRound size={23} /></span><div><span className="eyebrow">DADOS DA CONTA</span><h2>Informações pessoais</h2><p>Atualize seus dados no MoneyTrack.</p></div></div>
      <ErrorBanner message={error} />
      {success && <div className="success-banner" role="status"><Check size={16} />{success}</div>}
      <form className="form-stack" onSubmit={submit}>
        <label>Nome completo<input required maxLength="80" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>E-mail<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <div className="profile-demo-note">Esta demonstração acadêmica usa uma API JSON local. A senha não é armazenada na sessão do navegador.</div>
        <button className="button" disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'}</button>
      </form>
    </div>
  </div>
}

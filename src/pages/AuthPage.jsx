import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowDownLeft, ArrowRight, ShieldAlert } from 'lucide-react'
import { useAuth } from '../useAuth.js'
import { ErrorBanner } from '../components/Common.jsx'
import { getErrorMessage } from '../api.js'

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (isRegister && form.password !== form.confirm) return setError('As palavras-passe não coincidem.')
    if (form.password.length < 6) return setError('A palavra-passe deve ter pelo menos 6 caracteres.')
    setBusy(true)
    try {
      if (isRegister) await register(form)
      else await login(form.email.trim().toLowerCase(), form.password)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Link className="brand auth-brand" to="/"><span className="brand-mark"><ArrowDownLeft size={20} /></span><span>money<span className="brand-gold">track</span><small>FINANÇAS PESSOAIS</small></span></Link>
        <div className="visual-copy"><span className="eyebrow gold-eyebrow">AS SUAS FINANÇAS, MAIS CLARAS</span><h1>Pequenos passos.<br /><em>Finanças</em> mais fortes.</h1><p>Um só lugar para compreender as suas despesas, planear o futuro e pôr o dinheiro a trabalhar para si.</p></div>
        <div className="visual-bottom"><span>01 — CONHEÇA AS SUAS FINANÇAS</span><span>02 — PLANEIE O PRÓXIMO PASSO</span></div>
        <div className="visual-orb orb-one" /><div className="visual-orb orb-two" />
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <span className="eyebrow">{isRegister ? 'BOAS-VINDAS' : 'BEM-VINDO(A) DE VOLTA'}</span>
          <h2>{isRegister ? 'Crie a sua conta' : 'Aceda ao MoneyTrack'}</h2>
          <p className="auth-lede">{isRegister ? 'Comece a construir uma visão mais clara das suas finanças.' : 'O seu resumo financeiro está à distância de um instante.'}</p>
          <ErrorBanner message={error} />
          <form onSubmit={submit} className="form-stack">
            {isRegister && <label>Nome completo<input name="name" autoComplete="name" required value={form.name} onChange={change} placeholder="Alex Morgan" /></label>}
            <label>E-mail<input name="email" type="email" autoComplete="email" required value={form.email} onChange={change} placeholder="voce@exemplo.pt" /></label>
            <label>Palavra-passe<input name="password" type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} minLength="6" required value={form.password} onChange={change} placeholder="Pelo menos 6 caracteres" /></label>
            {isRegister && <label>Confirme a palavra-passe<input name="confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={change} placeholder="Introduza novamente a palavra-passe" /></label>}
            {!isRegister && <div className="demo-credentials"><span>Experimente a demonstração</span><button type="button" onClick={() => setForm({ ...form, email: 'alex@example.com', password: 'moneytrack' })}>Preencher dados de demonstração</button></div>}
            <button type="submit" className="button auth-submit" disabled={busy}>{busy ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}<ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">{isRegister ? 'Já tem uma conta?' : 'Ainda não utiliza o MoneyTrack?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Entrar' : 'Criar conta'}</Link></p>
          <div className="academic-notice"><ShieldAlert size={16} /><span>Demonstração académica. A autenticação é ilustrativa e não oferece segurança para produção. As palavras-passe nunca são guardadas no armazenamento do navegador.</span></div>
        </div>
        <footer className="auth-footer">© 2026 MoneyTrack <span>·</span> Finanças com perspetiva.</footer>
      </section>
    </div>
  )
}

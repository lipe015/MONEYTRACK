import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ArrowDownLeft, ArrowLeftRight, BarChart3, CircleUserRound, Coins, LogOut, Tags } from 'lucide-react'
import { useAuth } from '../useAuth.js'

const links = [
  { to: '/', label: 'Visão geral', icon: BarChart3, end: true },
  { to: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { to: '/categories', label: 'Categorias', icon: Tags },
  { to: '/budgets', label: 'Orçamentos', icon: Coins },
]

const titles = {
  '/': 'Visão geral',
  '/transactions': 'Transações',
  '/transactions/new': 'Nova transação',
  '/categories': 'Categorias',
  '/budgets': 'Orçamentos mensais',
  '/profile': 'Seu perfil',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [today] = useState(() => new Date())
  const title = location.pathname.includes('/edit') ? 'Editar transação' : titles[location.pathname] || 'MoneyTrack'
  const initials = user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="MoneyTrack home">
          <span className="brand-mark"><ArrowDownLeft size={20} /></span>
          <span>money<span className="brand-gold">track</span><small>FINANÇAS PESSOAIS</small></span>
        </Link>
        <div className="side-label">MENU</div>
        <nav className="main-nav" aria-label="Navegação principal">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} aria-label={label} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note"><span className="status-dot" /> Ambiente de demonstração <small>Guardado na API local</small></div>
          <NavLink to="/profile" className="account-link">
            <span className="avatar">{initials}</span>
            <span className="account-name">{user.name}<small>Conta pessoal</small></span>
            <CircleUserRound size={17} className="account-icon" />
          </NavLink>
          <button type="button" className="logout-button" onClick={logout}><LogOut size={17} /> Sair</button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><span className="eyebrow">AS SUAS FINANÇAS</span><h1>{title}</h1></div>
          <div className="topbar-right">
            <span className="today-label">{new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }).format(today)}</span>
            <span className="top-avatar">{initials}</span>
          </div>
        </header>
        <div className="page-content"><Outlet /></div>
      </main>
    </div>
  )
}

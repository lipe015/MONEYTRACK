import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Plus, Wallet } from 'lucide-react'
import { money } from '../api.js'

export function PageIntro({ title, description, action }) {
  return <div className="page-intro"><div><h2>{title}</h2><p>{description}</p></div>{action}</div>
}

export function ButtonLink({ to, children, secondary = false }) {
  return <Link className={`button${secondary ? ' button-secondary' : ''}`} to={to}><Plus size={16} />{children}</Link>
}

export function SummaryCard({ label, value, kind, note }) {
  const Icon = kind === 'income' ? ArrowDownRight : kind === 'expense' ? ArrowUpRight : Wallet
  return (
    <article className={`summary-card ${kind || 'balance'}`}>
      <div className="summary-top"><span>{label}</span><span className="summary-icon"><Icon size={17} /></span></div>
      <strong>{money(value)}</strong><small>{note}</small>
    </article>
  )
}

export function EmptyState({ title, description, action }) {
  return <div className="empty-state"><span className="empty-icon"><Wallet size={22} /></span><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function LoadingState() {
  return <div className="loading-state"><span className="spinner" /> A carregar as suas finanças...</div>
}

export function ErrorBanner({ message }) {
  return message ? <div className="error-banner" role="alert">{message}</div> : null
}

export function CategoryBadge({ category }) {
  return <span className="category-badge"><i style={{ backgroundColor: category?.color || '#777' }} />{category?.name || 'Sem categoria'}</span>
}

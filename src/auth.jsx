import { useState } from 'react'
import { AuthContext } from './auth-context.js'
import { api } from './api.js'

const SESSION_KEY = 'moneytrack-session'

function readSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY))
    return stored?.id ? { id: String(stored.id), name: stored.name, email: stored.email } : null
  } catch {
    return null
  }
}
function saveSession(user) {
  const safeUser = { id: String(user.id), name: user.name, email: user.email }
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
  return safeUser
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  async function login(email, password) {
    const matches = await api(`users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
    if (!matches.length) throw new Error('E-mail ou senha incorretos.')
    setUser(saveSession(matches[0]))
  }

  async function register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase()
    if ((await api(`users?email=${encodeURIComponent(normalizedEmail)}`)).length) {
      throw new Error('Já existe uma conta com este e-mail.')
    }
    const created = await api('users', {
      method: 'POST',
      body: { name: name.trim(), email: normalizedEmail, password },
    })
    setUser(saveSession(created))
  }

  async function updateProfile(profile) {
    const updated = await api(`users/${encodeURIComponent(user.id)}`, { method: 'PATCH', body: profile })
    setUser(saveSession(updated))
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const value = { user, login, register, updateProfile, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

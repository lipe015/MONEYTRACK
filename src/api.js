import seedDatabase from '../db.json'

const API_ROOT = '/api'
const DEMO_DATA_KEY = 'moneytrack-demo-data'
export const IS_STATIC_DEMO = import.meta.env.PROD

const DEMO_PASSWORDS = {
  'alex@example.com': 'moneytrack',
  'jamie@example.com': 'moneytrack',
}

function readDemoDatabase() {
  const stored = localStorage.getItem(DEMO_DATA_KEY)
  if (stored) return JSON.parse(stored)

  const initial = JSON.parse(JSON.stringify(seedDatabase))
  initial.users = initial.users.map((user) => Object.fromEntries(
    Object.entries(user).filter(([key]) => key !== 'password'),
  ))
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(initial))
  return initial
}

function staticDemoApi(resource, options) {
  const [path, queryString = ''] = resource.split('?')
  const [collection, rawId] = path.split('/')
  const id = rawId ? decodeURIComponent(rawId) : null
  const method = options.method || 'GET'
  const query = new URLSearchParams(queryString)
  const database = readDemoDatabase()
  const records = database[collection]

  if (!Array.isArray(records)) throw new Error('Recurso de demonstração desconhecido.')

  if (method === 'GET') {
    if (id) {
      const record = records.find((item) => String(item.id) === id)
      if (!record) throw new Error('Registo não encontrado.')
      return record
    }

    return records.filter((record) => {
      for (const [key, value] of query) {
        if (key === 'password') {
          if (DEMO_PASSWORDS[record.email] !== value) return false
        } else if (String(record[key]) !== value) {
          return false
        }
      }
      return true
    })
  }

  if (collection === 'users' && method === 'POST') {
    throw new Error('O registo de novas contas está desativado na demonstração pública.')
  }

  if (method === 'POST') {
    const record = { ...options.body, id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
    records.push(record)
    localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(database))
    return record
  }

  const index = records.findIndex((item) => String(item.id) === id)
  if (index < 0) throw new Error('Registo não encontrado.')

  if (method === 'PATCH') {
    records[index] = { ...records[index], ...options.body, id: records[index].id }
    localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(database))
    return records[index]
  }

  if (method === 'DELETE') {
    records.splice(index, 1)
    localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(database))
    return null
  }

  throw new Error(`Método não suportado: ${method}`)
}

export async function api(resource, options = {}) {
  if (IS_STATIC_DEMO) return staticDemoApi(resource, options)

  const response = await fetch(`${API_ROOT}/${resource}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed (${response.status})`)
  }
  if (response.status === 204) return null
  return response.json()
}

export const byUser = (resource, userId) => api(`${resource}?userId=${encodeURIComponent(userId)}`)
export const money = (value) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)
export const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
export const dateLabel = (date) => new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))

export function getErrorMessage(error) {
  if (error instanceof TypeError) return 'Não foi possível conectar à API de demonstração. Inicie com “npm run dev:api”.'
  return error?.message || 'Algo deu errado. Tente novamente.'
}

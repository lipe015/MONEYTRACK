const API_ROOT = '/api'

export async function api(resource, options = {}) {
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
export const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0)
export const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
export const dateLabel = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`))

export function getErrorMessage(error) {
  if (error instanceof TypeError) return 'Não foi possível conectar à API de demonstração. Inicie com “npm run dev:api”.'
  return error?.message || 'Algo deu errado. Tente novamente.'
}

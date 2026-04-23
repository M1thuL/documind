// In production, VITE_API_URL is set to your Azure App Service URL
// e.g. https://documind-api.azurewebsites.net
// In dev, it's empty and the Vite proxy handles /api -> localhost:8000
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api'

const token = () => localStorage.getItem('dm_token')

const headers = (extra = {}) => ({
  ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
  ...extra,
})

async function handle(res) {
  if (res.status === 401) {
    localStorage.removeItem('dm_token')
    localStorage.removeItem('dm_user')
    window.location.reload()
  }
  const data = await res.json().catch(() => ({ detail: res.statusText }))
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`)
  return data
}

export const api = {
  signup: (email, password) =>
    fetch(`${BASE}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(handle),

  login: (email, password) =>
    fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }).then(handle),

  getDocuments: () =>
    fetch(`${BASE}/ingest/documents`, { headers: headers() }).then(handle),

  uploadDocument: (file, onProgress) =>
    new Promise((resolve, reject) => {
      const fd = new FormData()
      fd.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${BASE}/ingest/`)
      xhr.setRequestHeader('Authorization', `Bearer ${token()}`)
      xhr.upload.onprogress = e => e.lengthComputable && onProgress?.(Math.round(e.loaded / e.total * 100))
      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText)
        xhr.status >= 400 ? reject(new Error(data.detail || `HTTP ${xhr.status}`)) : resolve(data)
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.send(fd)
    }),

  deleteDocument: (id) =>
    fetch(`${BASE}/ingest/documents/${encodeURIComponent(id)}`, { method: 'DELETE', headers: headers() }).then(handle),

  query: (question, documentIds, topK) =>
    fetch(`${BASE}/query/`, {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ question, document_ids: documentIds?.length ? documentIds : undefined, top_k: topK }),
    }).then(handle),
}

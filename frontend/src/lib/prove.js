const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : ''

export async function generateProof(useCase, inputs) {
  const res = await fetch(`${API_BASE}/api/prove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ useCase, inputs }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  return res.json()
}

export function bytesToHex(bytes) {
  return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

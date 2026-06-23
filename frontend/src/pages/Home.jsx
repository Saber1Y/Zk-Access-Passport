import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'zk_access_credential'

const defaultCredential = {
  age: 25, kyc_level: 3, already_sent: 500, monthly_limit: 2000,
  investor_type: 2, max_investment: 100000, restricted: 0,
  credential_secret: String(Math.floor(Math.random() * 100000)),
}

export default function Home() {
  const navigate = useNavigate()
  const saved = localStorage.getItem(STORAGE_KEY)
  const [form, setForm] = useState(saved ? JSON.parse(saved) : defaultCredential)
  const [savedMsg, setSavedMsg] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setSavedMsg('Credential saved!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem' }}>Issue Credential</h2>
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Enter your private attributes. These are never shared — they stay in your
          browser and are used to generate zero-knowledge proofs locally.
        </p>

        <div className="form-row">
          <div>
            <label>Age</label>
            <input type="number" value={form.age} onChange={e => set('age', +e.target.value)} />
          </div>
          <div>
            <label>KYC Level</label>
            <select value={form.kyc_level} onChange={e => set('kyc_level', +e.target.value)}>
              <option value={0}>0 — None</option>
              <option value={1}>1 — Basic</option>
              <option value={2}>2 — Enhanced</option>
              <option value={3}>3 — Institutional</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Already Sent (USD)</label>
            <input type="number" value={form.already_sent} onChange={e => set('already_sent', +e.target.value)} />
          </div>
          <div>
            <label>Monthly Limit (USD)</label>
            <input type="number" value={form.monthly_limit} onChange={e => set('monthly_limit', +e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Investor Type</label>
            <select value={form.investor_type} onChange={e => set('investor_type', +e.target.value)}>
              <option value={0}>0 — Retail</option>
              <option value={1}>1 — Accredited</option>
              <option value={2}>2 — Institutional</option>
            </select>
          </div>
          <div>
            <label>Max Investment (USD)</label>
            <input type="number" value={form.max_investment} onChange={e => set('max_investment', +e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Restricted Jurisdiction</label>
            <select value={form.restricted} onChange={e => set('restricted', +e.target.value)}>
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>
          <div>
            <label>Credential Secret</label>
            <input type="text" value={form.credential_secret} onChange={e => set('credential_secret', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button onClick={save}>Save Credential</button>
          {savedMsg && <span className="success" style={{ alignSelf: 'center' }}>{savedMsg}</span>}
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '0.75rem', color: '#666' }}>
          Try one of the compliance demos:
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/remit')}>Remit Demo</button>
          <button onClick={() => navigate('/rwa')}>RWA Demo</button>
        </div>
      </div>
    </div>
  )
}

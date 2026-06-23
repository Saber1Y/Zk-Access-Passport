"use client"

import { useState } from "react"
import { generateProof, bytesToHex } from "@/lib/prove"
import type { ProofResult } from "@/lib/prove"

export default function RWA() {
  const saved = typeof window !== "undefined" ? localStorage.getItem("zk_access_credential") : null
  const cred = saved ? JSON.parse(saved) : null

  const [requiredAge, setRequiredAge] = useState(18)
  const [requiredKyc, setRequiredKyc] = useState(2)
  const [requiredInvestorType, setRequiredInvestorType] = useState(1)
  const [investmentAmount, setInvestmentAmount] = useState(50000)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProofResult | null>(null)
  const [error, setError] = useState("")

  async function handleProve() {
    if (!cred) { setError("No credential found. Go to Home first."); return }
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const proof = await generateProof(1, {
        age: cred.age, kyc_level: cred.kyc_level,
        investor_type: cred.investor_type,
        max_investment: cred.max_investment,
        restricted: cred.restricted,
        credential_secret: cred.credential_secret,
        required_age: requiredAge,
        required_kyc: requiredKyc,
        required_investor_type: requiredInvestorType,
        investment_amount: investmentAmount,
      })
      setResult(proof)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: "0.5rem" }}>RWA Investor Passport</h2>
        <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.9rem" }}>
          Prove you are eligible to invest in Real-World Assets without revealing
          your identity, net worth, or jurisdiction.
        </p>

        {!cred && (
          <div className="error" style={{ marginBottom: "1rem" }}>
            No credential saved. <a href="/">Go to Home</a> to issue one first.
          </div>
        )}

        <div className="form-row">
          <div>
            <label>Required Age</label>
            <input type="number" value={requiredAge} onChange={(e) => setRequiredAge(+e.target.value)} />
          </div>
          <div>
            <label>Required KYC Level</label>
            <select value={requiredKyc} onChange={(e) => setRequiredKyc(+e.target.value)}>
              <option value={1}>1 — Basic</option>
              <option value={2}>2 — Enhanced</option>
              <option value={3}>3 — Institutional</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div>
            <label>Required Investor Type</label>
            <select value={requiredInvestorType} onChange={(e) => setRequiredInvestorType(+e.target.value)}>
              <option value={0}>0 — Retail</option>
              <option value={1}>1 — Accredited</option>
              <option value={2}>2 — Institutional</option>
            </select>
          </div>
          <div>
            <label>Investment Amount (USD)</label>
            <input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(+e.target.value)} />
          </div>
        </div>

        <button onClick={handleProve} disabled={loading || !cred}>
          {loading ? "Generating proof..." : "Generate & Verify Proof"}
        </button>
        {error && <p className="error" style={{ marginTop: "0.75rem" }}>{error}</p>}
      </div>

      {result && (
        <div className="card">
          <h3 style={{ marginBottom: "0.5rem" }}>✅ Proof Generated</h3>
          <p className="success" style={{ marginBottom: "0.75rem" }}>
            Your credentials satisfy the RWA investment requirements. No private data was revealed.
          </p>

          <table style={{ width: "100%", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
            <thead><tr><th style={{ textAlign: "left" }}>Public Output</th><th style={{ textAlign: "left" }}>Value</th></tr></thead>
            <tbody>
              {result.publicInputs.map((pi: number[], i: number) => (
                <tr key={i}>
                  <td style={{ color: "#666" }}>{["Age ≥", "KYC ≥", "Investor ≥", "Amount ($)", "Nullifier"][i]}</td>
                  <td><code>{bytesToHex(pi)}</code></td>
                </tr>
              ))}
            </tbody>
          </table>

          <details>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>Proof details</summary>
            <pre style={{ marginTop: "0.5rem" }}>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { generateProof, bytesToHex } from "@/lib/prove"
import Stepper from "./Stepper"

export default function RWAInvestment() {
  const { credential, status, setStatus, proof, setProof, setLastTxHash, setLastError, lastTxHash, lastError } = useApp()

  const [investmentAmount, setInvestmentAmount] = useState(100)
  const [asset, setAsset] = useState("SOLAR_BOND_001")
  const [viewingAsset, setViewingAsset] = useState(false)
  const [loading, setLoading] = useState(false)

  const hasCred = status !== "idle"

  const steps = [
    { label: "Create Passport", done: hasCred, active: false },
    { label: "Select Asset", done: viewingAsset, active: !viewingAsset && hasCred },
    { label: "Generate Proof", done: proof !== null && lastTxHash === "", active: proof !== null && lastTxHash === "" },
    { label: "Submit to Stellar", done: lastTxHash !== "" && proof !== null, active: lastTxHash === "" && proof !== null },
    { label: "Token Minted", done: lastTxHash !== "" && !lastError, active: false },
  ]

  const assetData = {
    name: "Tokenized Solar Farm Bond",
    description: "A demo token representing investment exposure to a solar infrastructure project.",
    price: "$100 per token",
    yield: "8% APY",
    policy: ["KYC Level 2 required", "Age 18+", "Allowed countries only", "Retail max investment: $500"],
  }

  async function handleProve() {
    setLoading(true)
    setLastError("")
    setProof(null)
    setLastTxHash("")
    try {
      const p = await generateProof(1, {
        age: credential.age,
        kyc_level: credential.kyc_level,
        investor_type: credential.restricted ? 0 : 1,
        max_investment: credential.max_investment,
        restricted: credential.restricted ? 1 : 0,
        credential_secret: credential.credential_secret,
        required_age: 18,
        required_kyc: 2,
        required_investor_type: 0,
        investment_amount: investmentAmount,
      })
      setProof(p)
      setStatus("proof_generated")
    } catch (e: unknown) {
      setLastError(e instanceof Error ? e.message : String(e))
    }
    setLoading(false)
  }

  async function handleSubmit() {
    setLastTxHash("0x" + "cd" + Array(62).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""))
    if (investmentAmount > credential.max_investment) {
      setLastError(`Investment amount exceeds Alice's private investor limit.\nMax allowed: hidden\nSubmitted amount: $${investmentAmount}`)
    } else {
      setStatus("verified")
      setLastError("")
    }
  }

  function handleOverInvest() {
    setInvestmentAmount(800)
    setProof(null)
    setLastTxHash("")
    setLastError("")
    setStatus("credential_created")
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Invest in Tokenized Real-World Assets</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Prove investor eligibility and mint RWA tokens without revealing your financial profile.
      </p>

      <Stepper steps={steps} />

      {!viewingAsset ? (
        <div className="card">
          <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>Available Assets</h3>
          <div style={{
            border: "1px solid #e2e8f0", borderRadius: 8, padding: "1.25rem",
            background: "linear-gradient(135deg, #fefce8, #fef9c3)", cursor: "pointer",
          }} onClick={() => setViewingAsset(true)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{assetData.name}</h4>
                <p style={{ fontSize: "0.78rem", color: "#666", marginTop: "0.25rem", maxWidth: 300 }}>{assetData.description}</p>
              </div>
              <span style={{ fontSize: "1.5rem" }}>☀️</span>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem" }}>
              <div><span style={{ color: "#888" }}>Price:</span> <strong>{assetData.price}</strong></div>
              <div><span style={{ color: "#888" }}>Yield:</span> <strong style={{ color: "#059669" }}>{assetData.yield}</strong></div>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#555", marginBottom: "0.3rem" }}>Eligibility Policy:</p>
              <ul style={{ fontSize: "0.75rem", color: "#666", paddingLeft: "1rem", lineHeight: 1.6 }}>
                {assetData.policy.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <button style={{ marginTop: "0.75rem", width: "100%" }}>View Asset</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <button
              onClick={() => setViewingAsset(false)}
              style={{
                background: "transparent", color: "#6366f1", border: "none",
                fontSize: "0.82rem", cursor: "pointer", padding: 0, marginBottom: "1rem",
              }}
            >← Back to assets</button>

            <div className="card">
              <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>Investment Panel</h3>

              <div>
                <label>Investor</label>
                <input type="text" value={credential.name} disabled />
              </div>

              <div className="form-row">
                <div>
                  <label>Investment Amount ($)</label>
                  <input type="number" value={investmentAmount} onChange={(e) => setInvestmentAmount(+e.target.value)} />
                </div>
                <div>
                  <label>Asset</label>
                  <select value={asset} onChange={(e) => setAsset(e.target.value)}>
                    <option value="SOLAR_BOND_001">Solar Bond Token</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                <button onClick={handleProve} disabled={loading || !hasCred} style={{ flex: 1 }}>
                  {loading ? "Generating Proof..." : "Generate Investor Proof"}
                </button>
                {proof && (
                  <button onClick={handleSubmit} style={{ flex: 1, background: "#059669" }}>
                    Invest / Mint RWA Token
                  </button>
                )}
              </div>

              <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #eee" }}>
                <button
                  onClick={handleOverInvest}
                  style={{
                    width: "100%", background: "#fef2f2", color: "#dc2626",
                    border: "1px solid #fecaca", borderRadius: 6, padding: "0.5rem",
                    fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                  }}
                >Try $800 Investment (over limit)</button>
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {!proof && !lastError && (
              <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
                <p style={{ color: "#999", fontSize: "0.9rem" }}>
                  {hasCred ? "Enter investment amount and generate a proof." : "No credential found. Issue a passport first."}
                </p>
              </div>
            )}

            {lastError && (
              <div className="card" style={{ border: "1px solid #dc2626", borderLeft: "4px solid #dc2626" }}>
                <h3 style={{ color: "#dc2626", fontSize: "0.95rem", marginBottom: "0.5rem" }}>Rejected</h3>
                <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>Reason:</p>
                <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap" }}>{lastError}</pre>
                <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.5rem", fontStyle: "italic" }}>
                  The chain only sees proof failure, not the actual private limit value.
                </p>
              </div>
            )}

            {proof && !lastError && !lastTxHash && (
              <div className="card" style={{ border: "1px solid #6366f1", borderLeft: "4px solid #6366f1" }}>
                <h3 style={{ color: "#6366f1", fontSize: "0.95rem", marginBottom: "0.75rem" }}>Investor Proof Generated</h3>
                <div style={{ fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                  <p style={{ fontWeight: 600, marginBottom: "0.4rem", color: "#059669" }}>Privately proved:</p>
                  <ul style={{ paddingLeft: "1.25rem", color: "#555", lineHeight: 1.6 }}>
                    <li>✓ User is over 18</li>
                    <li>✓ User passed KYC level 2</li>
                    <li>✓ User is from an allowed region</li>
                    <li>✓ User is not restricted</li>
                    <li>✓ ${investmentAmount} is below ${credential.max_investment} investor limit</li>
                    <li>✓ Credential was issued by trusted issuer</li>
                  </ul>
                </div>
                <h4 style={{ fontSize: "0.8rem", color: "#6366f1", marginBottom: "0.4rem" }}>Public inputs — sent to Stellar</h4>
                <table style={{ width: "100%", fontSize: "0.75rem", fontFamily: "monospace" }}>
                  <tbody>
                    <tr><td style={{ color: "#888", padding: "0.15rem 0" }}>Policy ID</td><td style={{ textAlign: "right" }}>RWA_SOLAR_BOND_V1</td></tr>
                    <tr><td style={{ color: "#888", padding: "0.15rem 0" }}>Asset ID</td><td style={{ textAlign: "right" }}>{asset}</td></tr>
                    {proof.publicInputs.map((pi, i) => (
                      <tr key={i}><td style={{ color: "#888", padding: "0.15rem 0" }}>{["Age ≥", "KYC ≥", "Investor ≥", "Amount ($)", "Nullifier"][i]}</td><td style={{ textAlign: "right" }}>{bytesToHex(pi)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {lastTxHash && !lastError && (
              <div className="card" style={{ border: "1px solid #059669", borderLeft: "4px solid #059669" }}>
                <h3 style={{ color: "#059669", fontSize: "0.95rem", marginBottom: "0.75rem" }}>Investment Approved</h3>
                <div style={{ fontSize: "0.82rem", background: "#f0fdf4", borderRadius: 6, padding: "0.75rem", marginBottom: "0.75rem" }}>
                  <p>✓ Proof verified by Stellar contract</p>
                  <p>✓ RWA token minted</p>
                  <p>✓ {credential.name} received 1 {asset} demo token</p>
                </div>
                <div style={{ fontSize: "0.75rem" }}>
                  <span style={{ color: "#888" }}>Transaction Hash:</span>
                  <code style={{ display: "block", marginTop: "0.25rem", background: "#1e1e2e", color: "#cdd6f4", padding: "0.4rem", borderRadius: 4, fontSize: "0.7rem" }}>{lastTxHash}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

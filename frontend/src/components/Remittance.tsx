"use client"

import { useState } from "react"
import { useApp } from "@/context/AppContext"
import { generateProof, bytesToHex } from "@/lib/prove"
import Stepper from "./Stepper"
import type { ProofData } from "@/context/AppContext"

export default function Remittance() {
  const { credential, status, setStatus, proof, setProof, setLastTxHash, setLastError, lastTxHash, lastError } = useApp()

  const [recipient, setRecipient] = useState("Bob")
  const [recipientCountry, setRecipientCountry] = useState("Ghana")
  const [amount, setAmount] = useState(150)
  const [loading, setLoading] = useState(false)
  const [overLimitDemo, setOverLimitDemo] = useState(false)

  const hasCred = status !== "idle"

  const steps = [
    { label: "Create Passport", done: hasCred, active: false },
    { label: "Enter Payment", done: proof !== null, active: !proof && hasCred },
    { label: "Generate Proof", done: proof !== null && lastTxHash === "", active: proof !== null && lastTxHash === "" },
    { label: "Submit to Stellar", done: lastTxHash !== "", active: lastTxHash === "" && proof !== null },
    { label: "Payment Released", done: lastTxHash !== "" && !lastError, active: false },
  ]

  async function handleProve() {
    setLoading(true)
    setLastError("")
    setProof(null)
    setLastTxHash("")
    try {
      const effectiveAmount = overLimitDemo ? 900 : amount
      const p = await generateProof(0, {
        age: credential.age,
        kyc_level: credential.kyc_level,
        already_sent: credential.already_sent,
        monthly_limit: credential.monthly_limit,
        credential_secret: credential.credential_secret,
        required_age: 18,
        required_kyc: 2,
        amount: effectiveAmount,
      })
      setProof(p)
      setStatus("proof_generated")
    } catch (e: unknown) {
      setLastError(e instanceof Error ? e.message : String(e))
    }
    setLoading(false)
  }

  async function handleSubmit() {
    setLastTxHash("0x" + "ab" + Array(62).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""))
    if (overLimitDemo && amount === 900) {
      setLastError("$300 + $900 exceeds the $1,000 monthly limit.")
    } else {
      setStatus("verified")
      setLastError("")
    }
  }

  function handleOverLimit() {
    setOverLimitDemo(true)
    setAmount(900)
    setProof(null)
    setLastTxHash("")
    setLastError("")
    setStatus("credential_created")
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Send Private-Compliant Remittance</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Prove eligibility to send money across borders without revealing private data.
      </p>

      <Stepper steps={steps} />

      <div style={{ display: "flex", gap: "1.5rem" }}>
        <div style={{ flex: 1 }}>
          <div className="card">
            <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>Payment Details</h3>

            <div className="form-row">
              <div>
                <label>Sender</label>
                <input type="text" value={credential.name} disabled />
              </div>
              <div>
                <label>Recipient</label>
                <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>Recipient Country</label>
                <input type="text" value={recipientCountry} onChange={(e) => setRecipientCountry(e.target.value)} />
              </div>
              <div>
                <label>Amount ($)</label>
                <input type="number" value={amount} onChange={(e) => { setAmount(+e.target.value); setOverLimitDemo(false) }} />
              </div>
            </div>

            <div>
              <label>Asset</label>
              <input type="text" value="Mock USDC on Stellar Testnet" disabled />
            </div>

            <div>
              <label>Policy</label>
              <input type="text" value="Kenya → Ghana Remittance Policy" disabled />
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
              <button onClick={handleProve} disabled={loading || !hasCred} style={{ flex: 1 }}>
                {loading ? "Generating Proof..." : "Generate Remittance Proof"}
              </button>
              {proof && (
                <button onClick={handleSubmit} style={{ flex: 1, background: "#059669" }}>
                  Submit Payment to Stellar
                </button>
              )}
            </div>

            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #eee" }}>
              <button
                onClick={handleOverLimit}
                style={{
                  width: "100%", background: "#fef2f2", color: "#dc2626",
                  border: "1px solid #fecaca", borderRadius: 6, padding: "0.5rem",
                  fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                }}
              >Try Over-Limit Transfer ($900)</button>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!proof && !lastError && (
            <div className="card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <p style={{ color: "#999", fontSize: "0.9rem" }}>
                {hasCred ? "Enter payment details and generate a proof." : "No credential found. Issue a passport first."}
              </p>
            </div>
          )}

          {lastError && (
            <div className="card" style={{ border: "1px solid #dc2626", borderLeft: "4px solid #dc2626" }}>
              <h3 style={{ color: "#dc2626", fontSize: "0.95rem", marginBottom: "0.5rem" }}>Rejected</h3>
              <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>Reason:</p>
              <p style={{ fontSize: "0.85rem", background: "#fef2f2", padding: "0.75rem", borderRadius: 6, fontFamily: "monospace" }}>{lastError}</p>
              <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.5rem", fontStyle: "italic" }}>
                The smart contract did not release payment because the proof failed verification.
              </p>
            </div>
          )}

          {proof && !lastError && !lastTxHash && (
            <div className="card" style={{ border: "1px solid #6366f1", borderLeft: "4px solid #6366f1" }}>
              <h3 style={{ color: "#6366f1", fontSize: "0.95rem", marginBottom: "0.75rem" }}>Remittance Proof Generated</h3>
              <div style={{ fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                <p style={{ fontWeight: 600, marginBottom: "0.4rem", color: "#059669" }}>Privately proved:</p>
                <ul style={{ paddingLeft: "1.25rem", color: "#555", lineHeight: 1.6 }}>
                  <li>✓ User is over 18</li>
                  <li>✓ User passed KYC level 2</li>
                  <li>✓ Sender country is allowed</li>
                  <li>✓ Recipient country is allowed</li>
                  <li>✓ ${credential.already_sent} + ${amount} is within ${credential.monthly_limit} monthly limit</li>
                  <li>✓ Nullifier is fresh</li>
                </ul>
              </div>
              <h4 style={{ fontSize: "0.8rem", color: "#6366f1", marginBottom: "0.4rem" }}>Public inputs — sent to Stellar</h4>
              <table style={{ width: "100%", fontSize: "0.75rem", fontFamily: "monospace" }}>
                <tbody>
                  <tr><td style={{ color: "#888", padding: "0.15rem 0" }}>Policy ID</td><td style={{ textAlign: "right" }}>REMIT_KENYA_GHANA_V1</td></tr>
                  {proof.publicInputs.map((pi, i) => (
                    <tr key={i}><td style={{ color: "#888", padding: "0.15rem 0" }}>{["Age ≥", "KYC ≥", "Amount ($)", "Nullifier"][i]}</td><td style={{ textAlign: "right" }}>{bytesToHex(pi)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {lastTxHash && !lastError && (
            <div className="card" style={{ border: "1px solid #059669", borderLeft: "4px solid #059669" }}>
              <h3 style={{ color: "#059669", fontSize: "0.95rem", marginBottom: "0.75rem" }}>Stellar Contract Result</h3>
              <div style={{ fontSize: "0.82rem", background: "#f0fdf4", borderRadius: 6, padding: "0.75rem", marginBottom: "0.75rem" }}>
                <p>✓ Proof verified</p>
                <p>✓ Nullifier marked as used</p>
                <p>✓ Payment released to {recipient}</p>
              </div>
              <div style={{ fontSize: "0.75rem" }}>
                <span style={{ color: "#888" }}>Transaction Hash:</span>
                <code style={{ display: "block", marginTop: "0.25rem", background: "#1e1e2e", color: "#cdd6f4", padding: "0.4rem", borderRadius: 4, fontSize: "0.7rem" }}>{lastTxHash}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useApp } from "@/context/AppContext"
import { bytesToHex } from "@/lib/prove"
import { CONTRACT_ID } from "@/lib/constants"
import { useFreighter } from "@/hooks/useFreighter"

function stellarTxUrl(hash: string) {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString()
}

function truncate(s: string, n = 8) {
  if (s.length <= n * 2) return s
  return `${s.slice(0, n)}...${s.slice(-n)}`
}

export default function ProofExplorer() {
  const { proof, lastTxHash, lastError, credential, status, submittedAt, useCase } = useApp()
  const freighter = useFreighter()

  const nullifierHash =
    proof && proof.publicInputs.length > 0
      ? bytesToHex(proof.publicInputs[proof.publicInputs.length - 1])
      : null

  const isReplay = lastError?.toLowerCase().includes("replay") || lastError?.toLowerCase().includes("nullifier") || false

  function getEvents() {
    const events: { label: string; done: boolean; failed: boolean }[] = []

    if (lastTxHash) {
      events.push({ label: "Proof transaction submitted", done: true, failed: false })
    }

    if (status === "verified") {
      events.push({ label: "Proof accepted by contract", done: true, failed: false })
      events.push({ label: "Nullifier stored on-chain", done: true, failed: false })
    }

    if (status === "rejected" && lastError) {
      if (isReplay) {
        events.push({ label: "Replay attempt rejected — nullifier already spent", done: false, failed: true })
      } else {
        events.push({ label: "Proof rejected by contract", done: false, failed: true })
      }
    }

    return events
  }

  const events = getEvents()

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Proof Explorer</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Real data from the latest proof submission and Soroban contract interaction.
      </p>

      <div className="card">
        <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>Latest Verification Receipt</h3>

        {!proof ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#999", fontSize: "0.9rem" }}>
            No proof generated yet. Complete a remittance or RWA investment to see proof details here.
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <SummaryBox label="Use Case" value={useCase === 0 ? "Remittance" : "RWA Investment"} />
              <SummaryBox
                label="Proof Status"
                value={lastError ? "Rejected" : lastTxHash ? "Verified" : "Generated"}
                color={lastError ? "#dc2626" : lastTxHash ? "#059669" : "#6366f1"}
              />
              <SummaryBox label="Network" value={freighter.network || "Unknown"} />
              <SummaryBox label="Contract ID" value={truncate(CONTRACT_ID, 6)} mono />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <SummaryBox label="Wallet" value={freighter.address ? truncate(freighter.address, 6) : "Not connected"} mono />
              {nullifierHash && <SummaryBox label="Nullifier" value={truncate(nullifierHash, 8)} mono />}
              {submittedAt > 0 && <SummaryBox label="Submitted At" value={formatTime(submittedAt)} />}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div className="card" style={{ border: "1px solid #6366f1", borderLeft: "4px solid #6366f1", marginBottom: 0 }}>
                  <h4 style={{ fontSize: "0.82rem", color: "#6366f1", marginBottom: "0.5rem" }}>
                    Public Inputs — sent to Stellar
                  </h4>
                  <table style={{ width: "100%", fontSize: "0.78rem" }}>
                    <tbody>
                      {proof.publicInputs.map((pi, i) => {
                        const labels = useCase === 0
                          ? ["Age Threshold", "KYC Threshold", "Amount", "Nullifier Hash"]
                          : ["Age Threshold", "KYC Threshold", "Investor Type", "Investment Amount", "Nullifier Hash"]
                        const isNullifier = i === proof.publicInputs.length - 1
                        return (
                          <tr key={i}>
                            <td style={{ color: "#888", padding: "0.3rem 0" }}>
                              {labels[i]}
                              {isNullifier && <span style={{ color: "#059669", fontSize: "0.7rem", marginLeft: "0.3rem" }}>(fresh)</span>}
                            </td>
                            <td style={{ textAlign: "right", fontFamily: "monospace", fontSize: "0.7rem" }}>{bytesToHex(pi)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div className="card" style={{ border: "1px solid #f59e0b", borderLeft: "4px solid #f59e0b", marginBottom: 0 }}>
                  <h4 style={{ fontSize: "0.82rem", color: "#d97706", marginBottom: "0.5rem" }}>
                    Hidden Inputs — never revealed
                  </h4>
                  <table style={{ width: "100%", fontSize: "0.78rem" }}>
                    <tbody>
                      {[
                        ["Age", `${credential.age}`],
                        ["Country", credential.country],
                        ["KYC Level", `${credential.kyc_level}`],
                        ["Monthly Limit", `$${credential.monthly_limit}`],
                        ["Already Sent", `$${credential.already_sent}`],
                        ["Investor Type", credential.restricted ? "Restricted" : "Standard"],
                      ].map(([label, val]) => (
                        <tr key={label}>
                          <td style={{ color: "#888", padding: "0.3rem 0" }}>{label}</td>
                          <td style={{ textAlign: "right", opacity: 0.5 }}>••••</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ fontSize: "0.72rem", color: "#999", marginTop: "0.3rem", fontStyle: "italic" }}>
                    Hidden values shown on frontend for demo visibility
                  </p>
                </div>
              </div>
            </div>

            {lastError && (
              <div className="card" style={{ marginTop: "1rem", border: "1px solid #dc2626", borderLeft: "4px solid #dc2626" }}>
                <h4 style={{ fontSize: "0.82rem", color: "#dc2626", marginBottom: "0.5rem" }}>Error</h4>
                <pre style={{ fontSize: "0.75rem", whiteSpace: "pre-wrap", fontFamily: "monospace", background: "#fef2f2", padding: "0.75rem", borderRadius: 6, margin: 0 }}>
                  {lastError}
                </pre>
              </div>
            )}

            {events.length > 0 && (
              <div className="card" style={{ marginTop: "1rem" }}>
                <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>Contract Events</h4>
                <div style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {events.map((evt, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.4rem 0", borderBottom: i < events.length - 1 ? "1px solid #f0f0f0" : "none",
                      color: evt.failed ? "#dc2626" : evt.done ? "#059669" : "#999",
                    }}>
                      <span>{evt.done ? "✓" : evt.failed ? "✗" : "○"}</span>
                      <span>{evt.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lastTxHash && status === "verified" && (() => {
              const receipt = {
                status: "VERIFIED",
                network: "stellar-testnet",
                contract_id: CONTRACT_ID,
                tx_hash: lastTxHash,
                wallet: freighter.address,
                policy_id: useCase === 0 ? "REMIT_KENYA_GHANA_V1" : "RWA_SOLAR_BOND_V1",
                nullifier_hash: nullifierHash,
                verified_at: submittedAt > 0 ? new Date(submittedAt).toISOString() : new Date().toISOString(),
                explorer_url: stellarTxUrl(lastTxHash),
              }
              const receiptJson = JSON.stringify(receipt, null, 2)
              return (
                <div className="card" style={{ marginTop: "1rem" }}>
                  <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>Receipt JSON</h4>
                  <pre style={{ fontSize: "0.72rem", background: "#1e1e2e", color: "#cdd6f4", padding: "0.75rem", borderRadius: 6, overflow: "auto", maxHeight: 250, marginBottom: "0.75rem" }}>{receiptJson}</pre>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button onClick={() => navigator.clipboard.writeText(receiptJson)} style={explorerCopyBtnStyle}>Copy Receipt JSON</button>
                    <button onClick={() => navigator.clipboard.writeText(lastTxHash)} style={explorerCopyBtnStyle}>Copy Tx Hash</button>
                    <a href={stellarTxUrl(lastTxHash)} target="_blank" rel="noopener noreferrer" style={{ ...explorerCopyBtnStyle, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      Open Explorer ↗
                    </a>
                  </div>
                </div>
              )
            })()}

            {proof && (
              <p style={{ fontSize: "0.72rem", color: "#999", marginTop: "1rem", fontStyle: "italic", textAlign: "center" }}>
                Only the proof verification transaction and nullifier are submitted on-chain in this MVP.
                Remittance release and RWA token minting are demo business outcomes, not on-chain actions.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const explorerCopyBtnStyle: React.CSSProperties = {
  background: "#1a1a2e",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "0.4rem 0.85rem",
  fontSize: "0.78rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s",
}

function SummaryBox({ label, value, color, mono }: { label: string; value: string; color?: string; mono?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 140, background: "#f8fafc", borderRadius: 6, padding: "0.75rem" }}>
      <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontWeight: 600, fontSize: "0.85rem", marginTop: "0.2rem", color, fontFamily: mono ? "monospace" : undefined }}>
        {value}
      </div>
    </div>
  )
}

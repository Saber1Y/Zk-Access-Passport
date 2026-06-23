"use client"

import { useApp } from "@/context/AppContext"
import { bytesToHex } from "@/lib/prove"

export default function ProofExplorer() {
  const { proof, lastTxHash, lastError, credential } = useApp()

  const remitEvents = ["ProofSubmitted", "ProofVerified", "NullifierUsed", "PaymentReleased"]
  const rwaEvents = ["ProofSubmitted", "ProofVerified", "NullifierUsed", "RWATokenMinted"]

  const useCaseLabel = proof?.useCase === 0 ? "Remittance" : "RWA Investment"

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>Proof Explorer</h2>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Inspect what was submitted to Stellar and what the contract executed.
      </p>

      <div className="card">
        <h3 style={{ fontSize: "0.95rem", marginBottom: "1rem" }}>Latest Proof</h3>

        {!proof ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#999", fontSize: "0.9rem" }}>
            No proof generated yet. Complete a remittance or RWA investment to see proof details here.
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1, background: "#f8fafc", borderRadius: 6, padding: "0.75rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Use Case</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginTop: "0.2rem" }}>{useCaseLabel}</div>
              </div>
              <div style={{ flex: 1, background: "#f8fafc", borderRadius: 6, padding: "0.75rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Proof Status</div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginTop: "0.2rem", color: lastError ? "#dc2626" : lastTxHash ? "#059669" : "#6366f1" }}>
                  {lastError ? "Rejected" : lastTxHash ? "Verified" : "Generated"}
                </div>
              </div>
              <div style={{ flex: 1, background: "#f8fafc", borderRadius: 6, padding: "0.75rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Policy</div>
                <div style={{ fontWeight: 600, marginTop: "0.2rem", fontFamily: "monospace", fontSize: "0.78rem" }}>
                  {proof.useCase === 0 ? "REMIT_KENYA_GHANA_V1" : "RWA_SOLAR_BOND_V1"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div className="card" style={{ border: "1px solid #6366f1", borderLeft: "4px solid #6366f1", marginBottom: 0 }}>
                  <h4 style={{ fontSize: "0.82rem", color: "#6366f1", marginBottom: "0.5rem" }}>
                    📡 Public Inputs — sent to Stellar
                  </h4>
                  <table style={{ width: "100%", fontSize: "0.78rem" }}>
                    <tbody>
                      {proof.publicInputs.map((pi, i) => {
                        const labels = proof.useCase === 0
                          ? ["Age Threshold", "KYC Threshold", "Amount", "Nullifier Hash"]
                          : ["Age Threshold", "KYC Threshold", "Investor Type", "Investment Amount", "Nullifier Hash"]
                        return (
                          <tr key={i}>
                            <td style={{ color: "#888", padding: "0.3rem 0" }}>{labels[i]}</td>
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
                    🔒 Hidden Inputs — never revealed
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

            <div className="card" style={{ marginTop: "1rem" }}>
              <h4 style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>Contract Events</h4>
              <div style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                {(proof.useCase === 0 ? remitEvents : rwaEvents).map((evt, i) => {
                  const isLast = (proof.useCase === 0 ? remitEvents : rwaEvents).length - 1 === i
                  const isFailed = lastError && i >= 2
                  const isDone = lastTxHash && !lastError && (i <= 2)
                  const isSubmitted = lastTxHash && !lastError && isLast
                  return (
                    <div key={evt} style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.4rem 0", borderBottom: i < 4 ? "1px solid #f0f0f0" : "none",
                      color: isFailed ? "#dc2626" : isDone || isSubmitted ? "#059669" : "#999",
                    }}>
                      <span>{isDone || isSubmitted ? "✓" : isFailed ? "✗" : "○"}</span>
                      <span>{evt}</span>
                      {isDone && i === 2 && <span style={{ fontSize: "0.7rem", color: "#059669" }}>— confirmed</span>}
                      {isSubmitted && <span style={{ fontSize: "0.7rem", color: "#059669" }}>— confirmed</span>}
                      {isFailed && <span style={{ fontSize: "0.7rem", color: "#dc2626" }}>— failed</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {lastTxHash && (
              <div className="card" style={{ marginTop: "1rem" }}>
                <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>Transaction</h4>
                <div style={{ fontSize: "0.75rem" }}>
                  <span style={{ color: "#888" }}>Hash:</span>
                  <code style={{ display: "block", marginTop: "0.25rem", background: "#1e1e2e", color: "#cdd6f4", padding: "0.4rem", borderRadius: 4, fontSize: "0.7rem" }}>{lastTxHash}</code>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

"use client"

import { useApp } from "@/context/AppContext"

export default function Dashboard() {
  const { setTab } = useApp()

  const features = [
    { title: "Private Data", desc: "Age, country, KYC level, and limits stay hidden — never sent to the blockchain.", icon: "🔒" },
    { title: "ZK Proof", desc: "User proves eligibility without revealing identity using Groth16 zero-knowledge proofs.", icon: "🧩" },
    { title: "Stellar Verification", desc: "Soroban smart contract verifies the proof and executes the approved action.", icon: "⚡" },
  ]

  return (
    <div>
      <div className="hero" style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#fff", borderRadius: 12, padding: "2.5rem 2rem", marginBottom: "1.5rem",
        textAlign: "center",
      }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>ZK Access Passport</h2>
        <p style={{ fontSize: "1rem", color: "#94a3b8", marginBottom: "1.5rem", maxWidth: 480, margin: "0 auto 1.5rem" }}>
          Prove financial eligibility for Stellar payments and tokenized assets without revealing private identity data.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={() => setTab("issue")}
            style={{
              padding: "0.7rem 1.5rem", fontSize: "0.9rem", fontWeight: 600,
              background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
            }}
          >Issue Private Passport</button>
          <button
            onClick={() => setTab("remittance")}
            style={{
              padding: "0.7rem 1.5rem", fontSize: "0.9rem", fontWeight: 600,
              background: "transparent", color: "#fff", border: "1px solid #6366f1", borderRadius: 8, cursor: "pointer",
            }}
          >Send Remittance Privately</button>
          <button
            onClick={() => setTab("rwa")}
            style={{
              padding: "0.7rem 1.5rem", fontSize: "0.9rem", fontWeight: 600,
              background: "transparent", color: "#fff", border: "1px solid #6366f1", borderRadius: 8, cursor: "pointer",
            }}
          >Invest in Tokenized RWA</button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>How it works</h3>
        <div style={{ display: "flex", gap: "0.75rem", counterReset: "step" }}>
          {["User receives a private credential", "User generates a zero-knowledge proof", "Soroban contract verifies proof on Stellar", "Payment or investment is approved"].map((step, i) => (
            <div key={i} style={{ flex: 1, background: "#f8fafc", borderRadius: 8, padding: "0.75rem", textAlign: "center", position: "relative" }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: "#6366f1", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem",
                fontWeight: 700, margin: "0 auto 0.5rem",
              }}>{i + 1}</div>
              <p style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.4 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {features.map((f) => (
          <div key={f.title} className="card" style={{ flex: 1, marginBottom: 0 }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{f.icon}</div>
            <h4 style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>{f.title}</h4>
            <p style={{ fontSize: "0.78rem", color: "#666", lineHeight: 1.4 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

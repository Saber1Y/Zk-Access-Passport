"use client"

export default function WalletStatus() {
  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: "0.8rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
        <span>Wallet: Connected</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
        <span>Network: Stellar Testnet</span>
      </div>
    </div>
  )
}

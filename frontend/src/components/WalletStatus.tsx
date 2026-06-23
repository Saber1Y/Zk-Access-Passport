"use client"

import { useFreighter } from "@/hooks/useFreighter"
import { useIsMounted } from "@/hooks/useIsMounted"

export default function WalletStatus() {
  const mounted = useIsMounted()
  const { address, displayName, network, connected, connecting, connect, error } = useFreighter()

  if (!mounted) return null

  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: "0.8rem" }}>
      {connected ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#22c55e", display: "inline-block",
            }} />
            <span title={address}>{displayName}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: network === "TESTNET" ? "#22c55e" : "#f59e0b",
              display: "inline-block",
            }} />
            <span>{network || "Unknown"}</span>
          </div>
        </>
      ) : (
        <button
          onClick={connect}
          disabled={connecting}
          style={{
            background: "#6366f1", color: "#fff", border: "none",
            borderRadius: 6, padding: "0.35rem 0.75rem", fontSize: "0.75rem",
            fontWeight: 600, cursor: "pointer",
          }}
        >
          {connecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
      {error && (
        <span style={{ color: "#dc2626", fontSize: "0.72rem" }}>{error}</span>
      )}
    </div>
  )
}

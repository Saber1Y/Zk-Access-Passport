"use client"

import { useFreighter } from "@/hooks/useFreighter"
import { useIsMounted } from "@/hooks/useIsMounted"

export default function WalletStatus() {
  const mounted = useIsMounted()
  const { address, displayName, network, connected, connecting, connect, disconnect, error } = useFreighter()

  if (!mounted) return null

  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", fontSize: "0.8rem" }}>
      {connected ? (
        <>
          <span className="hide-mobile" style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#22c55e", display: "inline-block",
          }} />
          <span className="hide-mobile" title={address} style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</span>
          <span className="hide-mobile" style={{
            width: 8, height: 8, borderRadius: "50%",
            background: network === "TESTNET" ? "#22c55e" : "#f59e0b",
            display: "inline-block",
          }} />
          <span className="hide-mobile" style={{ fontSize: "0.7rem" }}>{network || "Unknown"}</span>
          <button
            onClick={disconnect}
            style={{
              background: "transparent", color: "#dc2626", border: "1px solid #dc2626",
              borderRadius: 6, padding: "0.25rem 0.6rem", fontSize: "0.7rem",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            Disconnect
          </button>
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
      {error && connected === false && (
        <span style={{ color: "#dc2626", fontSize: "0.72rem", maxWidth: 180 }}>{error}</span>
      )}
    </div>
  )
}

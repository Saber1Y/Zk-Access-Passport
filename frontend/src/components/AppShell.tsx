"use client"

import Sidebar from "./Sidebar"
import WalletStatus from "./WalletStatus"

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.6rem 1.5rem", background: "#1a1a2e", color: "#eee",
        borderBottom: "1px solid #333",
      }}>
        <div>
          <h1 style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.01em" }}>ZK Access Passport</h1>
          <p style={{ fontSize: "0.7rem", color: "#888", marginTop: "0.1rem" }}>Private Compliance for Stellar</p>
        </div>
        <WalletStatus />
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto", background: "#f5f7fa" }}>
          {children}
        </main>
      </div>
    </div>
  )
}

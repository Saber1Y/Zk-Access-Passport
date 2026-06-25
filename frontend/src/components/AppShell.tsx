"use client"

import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import WalletStatus from "./WalletStatus"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.6rem 1rem",
          background: "#1a1a2e",
          color: "#eee",
          borderBottom: "1px solid #333",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#eee",
                fontSize: "1.3rem",
                cursor: "pointer",
                padding: "0.2rem",
                lineHeight: 1,
              }}
              aria-label="Open menu"
            >
              ☰
            </button>
          )}
          <div>
            <h1
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              ZK Access Passport
            </h1>
            <p style={{ fontSize: "0.7rem", color: "#888", marginTop: "0.1rem" }}>
              Private Compliance for Stellar
            </p>
          </div>
        </div>
        <WalletStatus />
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        <main
          style={{
            flex: 1,
            padding: isMobile ? "1rem" : "1.5rem 2rem",
            overflowY: "auto",
            background: "#f5f7fa",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

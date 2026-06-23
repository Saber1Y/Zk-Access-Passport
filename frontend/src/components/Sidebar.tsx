"use client"

import type { Tab } from "@/context/AppContext"
import { useApp } from "@/context/AppContext"

const tabs: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "issue", label: "Issue Passport" },
  { key: "remittance", label: "Remittance" },
  { key: "rwa", label: "RWA Investment" },
  { key: "explorer", label: "Proof Explorer" },
]

export default function Sidebar() {
  const { tab, setTab } = useApp()

  return (
    <aside style={{
      width: 200, background: "#1a1a2e", color: "#ccc",
      display: "flex", flexDirection: "column", padding: "1rem 0",
      flexShrink: 0, height: "100%",
    }}>
      <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid #333", marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.7rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>Navigate</div>
      </div>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          style={{
            textAlign: "left", background: "transparent", color: tab === t.key ? "#fff" : "#888",
            border: "none", padding: "0.6rem 1rem", cursor: "pointer", fontSize: "0.85rem",
            fontWeight: tab === t.key ? 600 : 400, borderLeft: tab === t.key ? "3px solid #6366f1" : "3px solid transparent",
          }}
        >
          {t.label}
        </button>
      ))}
    </aside>
  )
}

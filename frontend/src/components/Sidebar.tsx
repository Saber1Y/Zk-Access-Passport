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

export default function Sidebar({
  isOpen,
  onClose,
  isMobile,
}: {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}) {
  const { tab, setTab } = useApp()

  function handleSelect(key: Tab) {
    setTab(key)
    if (isMobile) onClose()
  }

  const sidebar = (
    <aside
      style={{
        width: 200,
        background: "#1a1a2e",
        color: "#ccc",
        display: "flex",
        flexDirection: "column",
        padding: "1rem 0",
        flexShrink: 0,
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "0 1rem 1rem",
          borderBottom: "1px solid #333",
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Navigate
        </div>
      </div>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => handleSelect(t.key)}
          style={{
            textAlign: "left",
            background: "transparent",
            color: tab === t.key ? "#fff" : "#888",
            border: "none",
            padding: "0.6rem 1rem",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: tab === t.key ? 600 : 400,
            borderLeft:
              tab === t.key
                ? "3px solid #6366f1"
                : "3px solid transparent",
          }}
        >
          {t.label}
        </button>
      ))}
    </aside>
  )

  if (!isMobile) return sidebar

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          boxShadow: isOpen ? "4px 0 20px rgba(0,0,0,0.3)" : "none",
        }}
      >
        {sidebar}
      </div>
    </>
  )
}

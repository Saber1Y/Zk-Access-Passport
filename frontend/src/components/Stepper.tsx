"use client"

interface Step {
  label: string
  done: boolean
  active: boolean
}

export default function Stepper({ steps }: { steps: Step[] }) {
  return (
    <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
      {steps.map((s, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: "50%", fontSize: "0.7rem", fontWeight: 600,
            background: s.done ? "#059669" : s.active ? "#6366f1" : "#e5e7eb",
            color: s.done || s.active ? "#fff" : "#999",
          }}>
            {s.done ? "✓" : i + 1}
          </span>
          <span style={{ fontSize: "0.75rem", color: s.active ? "#1a1a2e" : "#999", fontWeight: s.active ? 600 : 400 }}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span style={{ color: "#d0d5dd", fontSize: "0.7rem", margin: "0 0.25rem" }}>→</span>}
        </span>
      ))}
    </div>
  )
}

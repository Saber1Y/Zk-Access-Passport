"use client"

import { AppProvider, useApp } from "@/context/AppContext"
import AppShell from "@/components/AppShell"
import Dashboard from "@/components/Dashboard"
import IssuePassport from "@/components/IssuePassport"
import Remittance from "@/components/Remittance"
import RWAInvestment from "@/components/RWAInvestment"
import ProofExplorer from "@/components/ProofExplorer"

function AppContent() {
  const { tab } = useApp()

  switch (tab) {
    case "dashboard": return <Dashboard />
    case "issue": return <IssuePassport />
    case "remittance": return <Remittance />
    case "rwa": return <RWAInvestment />
    case "explorer": return <ProofExplorer />
    default: return <Dashboard />
  }
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell>
        <AppContent />
      </AppShell>
    </AppProvider>
  )
}

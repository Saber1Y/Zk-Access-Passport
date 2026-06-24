"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export type Tab = "dashboard" | "issue" | "remittance" | "rwa" | "explorer"
export type Status = "idle" | "credential_created" | "proof_generated" | "submitted" | "verified" | "rejected"

export interface ProofData {
  useCase: number
  pi_a: number[]
  pi_b: number[]
  pi_c: number[]
  publicInputs: number[][]
}

export interface Credential {
  name: string
  age: number
  country: string
  kyc_level: number
  monthly_limit: number
  already_sent: number
  max_investment: number
  restricted: boolean
  credential_secret: string
}

const CRED_KEY = "zk_access_credential"
const STATUS_KEY = "zk_access_status"
const PROOF_KEY = "zk_access_proof"
const TX_KEY = "zk_access_tx_hash"
const ERROR_KEY = "zk_access_error"
const UC_KEY = "zk_access_use_case"
const TS_KEY = "zk_access_submitted_at"

const defaults: Credential = {
  name: "Alice",
  age: 24,
  country: "Kenya",
  kyc_level: 2,
  monthly_limit: 1000,
  already_sent: 300,
  max_investment: 500,
  restricted: false,
  credential_secret: String(Math.floor(Math.random() * 100000)),
}

export const PRESETS: Record<string, Credential> = {
  eligible_alice: { name: "Alice", age: 24, country: "Kenya", kyc_level: 2, monthly_limit: 1000, already_sent: 300, max_investment: 500, restricted: false, credential_secret: "998877" },
  underage: { name: "Charlie", age: 16, country: "Kenya", kyc_level: 1, monthly_limit: 500, already_sent: 0, max_investment: 100, restricted: false, credential_secret: "887766" },
  restricted_investor: { name: "Diana", age: 30, country: "Iran", kyc_level: 3, monthly_limit: 5000, already_sent: 0, max_investment: 10000, restricted: true, credential_secret: "776655" },
  over_limit: { name: "Eve", age: 28, country: "Kenya", kyc_level: 2, monthly_limit: 1000, already_sent: 800, max_investment: 500, restricted: false, credential_secret: "665544" },
}

interface AppState {
  tab: Tab
  setTab: (t: Tab) => void
  credential: Credential
  setCredential: (c: Credential) => void
  status: Status
  setStatus: (s: Status) => void
  proof: ProofData | null
  setProof: (p: ProofData | null) => void
  lastTxHash: string
  setLastTxHash: (h: string) => void
  lastError: string
  setLastError: (e: string) => void
  useCase: number
  setUseCase: (u: number) => void
  submittedAt: number
  setSubmittedAt: (t: number) => void
  loadPreset: (name: string) => void
  saveCredential: () => void
  reset: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>("dashboard")
  const [credential, setCredential] = useState<Credential>(defaults)
  const [status, setStatus] = useState<Status>("idle")
  const [proof, setProof] = useState<ProofData | null>(null)
  const [lastTxHash, setLastTxHash] = useState("")
  const [lastError, setLastError] = useState("")
  const [useCase, setUseCase] = useState(0)
  const [submittedAt, setSubmittedAt] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    const cred = localStorage.getItem(CRED_KEY)
    if (cred) {
      try { setCredential(JSON.parse(cred)) } catch {}
    } else {
      localStorage.setItem(CRED_KEY, JSON.stringify(defaults))
    }

    const s = localStorage.getItem(STATUS_KEY)
    if (s) setStatus(s as Status)

    const p = localStorage.getItem(PROOF_KEY)
    if (p) { try { setProof(JSON.parse(p)) } catch {} }

    const tx = localStorage.getItem(TX_KEY)
    if (tx) setLastTxHash(tx)

    const e = localStorage.getItem(ERROR_KEY)
    if (e) setLastError(e)

    const u = localStorage.getItem(UC_KEY)
    if (u) setUseCase(Number(u))

    const ts = localStorage.getItem(TS_KEY)
    if (ts) setSubmittedAt(Number(ts))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(STATUS_KEY, status)
    localStorage.setItem(PROOF_KEY, proof ? JSON.stringify(proof) : "")
    localStorage.setItem(TX_KEY, lastTxHash)
    localStorage.setItem(ERROR_KEY, lastError)
    localStorage.setItem(UC_KEY, String(useCase))
    localStorage.setItem(TS_KEY, String(submittedAt))
  }, [status, proof, lastTxHash, lastError, useCase, submittedAt])

  const loadPreset = useCallback((name: string) => {
    const p = PRESETS[name]
    if (p) setCredential({ ...p })
  }, [])

  const saveCredential = useCallback(() => {
    localStorage.setItem(CRED_KEY, JSON.stringify(credential))
    setStatus("credential_created")
  }, [credential])

  const reset = useCallback(() => {
    setStatus("idle")
    setProof(null)
    setLastTxHash("")
    setLastError("")
    setSubmittedAt(0)
  }, [])

  return (
    <AppContext.Provider value={{
      tab, setTab, credential, setCredential, status, setStatus,
      proof, setProof, lastTxHash, setLastTxHash, lastError, setLastError,
      useCase, setUseCase, submittedAt, setSubmittedAt, loadPreset, saveCredential, reset,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

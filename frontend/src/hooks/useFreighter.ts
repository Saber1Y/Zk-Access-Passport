"use client"

import { useEffect, useState, useCallback } from "react"
import { isConnected, getAddress, requestAccess, getNetworkDetails } from "@stellar/freighter-api"

export interface FreighterState {
  address: string
  displayName: string
  network: string
  networkPassphrase: string
  sorobanRpcUrl: string
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  error: string | null
}

function displayName(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export function useFreighter(): FreighterState {
  const [address, setAddress] = useState("")
  const [network, setNetwork] = useState("")
  const [networkPassphrase, setNetworkPassphrase] = useState("")
  const [sorobanRpcUrl, setSorobanRpcUrl] = useState("")
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (): Promise<boolean> => {
    const avail = await isConnected()
    if (!avail.isConnected) return false

    const addrResult = await getAddress()
    if (addrResult.error) return false

    setAddress(addrResult.address)
    setConnected(true)
    setError(null)

    const net = await getNetworkDetails()
    setNetwork(net.network)
    setNetworkPassphrase(net.networkPassphrase)
    setSorobanRpcUrl(net.sorobanRpcUrl ?? "")
    return true
  }, [])

  useEffect(() => { load() }, [load])

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const result = await requestAccess()
      if (result.error) {
        setError(result.error)
      } else {
        setAddress(result.address)
        setConnected(true)

        const net = await getNetworkDetails()
        setNetwork(net.network)
        setNetworkPassphrase(net.networkPassphrase)
        setSorobanRpcUrl(net.sorobanRpcUrl ?? "")
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Connection cancelled")
    }
    setConnecting(false)
  }, [])

  return {
    address,
    displayName: address ? displayName(address) : "",
    network,
    networkPassphrase,
    sorobanRpcUrl,
    connected,
    connecting,
    connect,
    error,
  }
}

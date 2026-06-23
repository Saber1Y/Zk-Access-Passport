"use client"

import { useEffect, useState, useCallback } from "react"
import { isConnected, isAllowed, setAllowed, getAddress, getNetworkDetails } from "@stellar/freighter-api"

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

let cached: { address: string; displayName: string; network: string; networkPassphrase: string; sorobanRpcUrl: string } | null = null

function displayName(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export function useFreighter(): FreighterState {
  const [address, setAddress] = useState(cached?.address ?? "")
  const [network, setNetwork] = useState(cached?.network ?? "")
  const [networkPassphrase, setNetworkPassphrase] = useState(cached?.networkPassphrase ?? "")
  const [sorobanRpcUrl, setSorobanRpcUrl] = useState(cached?.sorobanRpcUrl ?? "")
  const [connected, setConnected] = useState(!!cached)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const avail = await isConnected()
    if (!avail.isConnected) {
      setError("Freighter not detected")
      return
    }
    const allowed = await isAllowed()
    if (!allowed.isAllowed) return

    const addrResult = await getAddress()
    if (addrResult.error) {
      setError(addrResult.error)
      return
    }
    setAddress(addrResult.address)
    setConnected(true)
    setError(null)

    const net = await getNetworkDetails()
    setNetwork(net.network)
    setNetworkPassphrase(net.networkPassphrase)
    setSorobanRpcUrl(net.sorobanRpcUrl ?? "")

    cached = {
      address: addrResult.address,
      displayName: displayName(addrResult.address),
      network: net.network,
      networkPassphrase: net.networkPassphrase,
      sorobanRpcUrl: net.sorobanRpcUrl ?? "",
    }
  }, [])

  useEffect(() => { load() }, [load])

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const result = await setAllowed()
      if (!result.isAllowed) {
        setError("Connection rejected")
        return
      }
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Connection failed")
    }
    setConnecting(false)
  }, [load])

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

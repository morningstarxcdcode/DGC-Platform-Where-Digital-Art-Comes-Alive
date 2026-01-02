import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS_BASE = API_BASE.replace('http', 'ws')

/**
 * Enhanced WebSocket Hook for Real-Time Data Integration
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Connection state management
 * - Message queuing during disconnection
 * - Multiple endpoint support
 * - Error handling and recovery
 * 
 * Validates: Real-Time Data Integration Requirements
 */

export function useWebSocket(endpoint, options = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 1000,
    maxReconnectAttempts = 5,
    onMessage = null,
    onConnect = null,
    onDisconnect = null,
    onError = null
  } = options

  const [connectionState, setConnectionState] = useState('disconnected')
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)

  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const messageQueueRef = useRef([])
  const reconnectIntervalRef = useRef(reconnectInterval)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = `${WS_BASE}${endpoint}`
      console.log(`Connecting to WebSocket: ${wsUrl}`)
      
      wsRef.current = new WebSocket(wsUrl)
      setConnectionState('connecting')
      setError(null)

      wsRef.current.onopen = () => {
        console.log(`WebSocket connected: ${endpoint}`)
        setConnectionState('connected')
        setReconnectAttempts(0)
        reconnectIntervalRef.current = reconnectInterval

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift()
          wsRef.current.send(message)
        }

        if (onConnect) {
          onConnect()
        }
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastMessage(data)
          
          if (onMessage) {
            onMessage(data)
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e)
          setError('Failed to parse message')
        }
      }

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket disconnected: ${endpoint}`, event.code, event.reason)
        setConnectionState('disconnected')
        
        if (onDisconnect) {
          onDisconnect(event)
        }

        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(reconnectIntervalRef.current * Math.pow(2, reconnectAttempts), 30000)
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1)
            connect()
          }, delay)
        }
      }

      wsRef.current.onerror = (event) => {
        console.error(`WebSocket error: ${endpoint}`, event)
        setError('Connection error')
        setConnectionState('error')
        
        if (onError) {
          onError(event)
        }
      }

    } catch (e) {
      console.error('WebSocket connection failed:', e)
      setError('Failed to connect')
      setConnectionState('error')
    }
  }, [endpoint, reconnectAttempts, maxReconnectAttempts, reconnectInterval, onMessage, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
    }
    
    setConnectionState('disconnected')
    setReconnectAttempts(0)
  }, [])

  const sendMessage = useCallback((message) => {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message)
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(messageStr)
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(messageStr)
      console.log('Message queued (WebSocket not connected):', message)
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(connect, 100)
  }, [connect, disconnect])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount')
      }
    }
  }, [autoConnect, connect])

  return {
    connectionState,
    lastMessage,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    isDisconnected: connectionState === 'disconnected',
    hasError: connectionState === 'error'
  }
}

/**
 * Specialized WebSocket hooks for different endpoints
 */

export function useWalletWebSocket(address, options = {}) {
  return useWebSocket(`/ws/wallet/${address}`, {
    ...options,
    autoConnect: !!address
  })
}

export function useAgentsWebSocket(options = {}) {
  return useWebSocket('/ws/agents', options)
}

export function useSearchWebSocket(options = {}) {
  return useWebSocket('/ws/search', options)
}

/**
 * Real-Time Data Manager Hook
 * 
 * Manages multiple WebSocket connections and provides unified data access
 */
export function useRealTimeData(address) {
  const [walletData, setWalletData] = useState(null)
  const [gasPrice, setGasPrice] = useState(null)
  const [marketData, setMarketData] = useState(null)
  const [agentStatus, setAgentStatus] = useState({})
  const [searchUpdates, setSearchUpdates] = useState([])

  // Wallet WebSocket
  const walletWs = useWalletWebSocket(address, {
    onMessage: (data) => {
      switch (data.type) {
        case 'balance_update':
          setWalletData(prev => prev ? { ...prev, ...data } : data)
          break
        case 'gas_update':
          setGasPrice(data.gas_price)
          break
        case 'market_update':
          setMarketData(data)
          break
        case 'transaction_update':
          setWalletData(prev => prev ? {
            ...prev,
            transactions: [data.transaction, ...(prev.transactions || []).slice(0, 9)]
          } : prev)
          break
      }
    }
  })

  // Agents WebSocket
  const agentsWs = useAgentsWebSocket({
    onMessage: (data) => {
      switch (data.type) {
        case 'agent_progress':
          setAgentStatus(prev => ({
            ...prev,
            [data.agent_id]: data
          }))
          break
        case 'agent_complete':
          setAgentStatus(prev => ({
            ...prev,
            [data.agent_id]: { ...prev[data.agent_id], ...data }
          }))
          break
      }
    }
  })

  // Search WebSocket
  const searchWs = useSearchWebSocket({
    onMessage: (data) => {
      switch (data.type) {
        case 'new_block':
        case 'new_transaction':
          setSearchUpdates(prev => [data, ...prev.slice(0, 49)])
          break
      }
    }
  })

  return {
    // Data
    walletData,
    gasPrice,
    marketData,
    agentStatus,
    searchUpdates,
    
    // Connection states
    walletConnected: walletWs.isConnected,
    agentsConnected: agentsWs.isConnected,
    searchConnected: searchWs.isConnected,
    
    // Connection controls
    reconnectWallet: walletWs.reconnect,
    reconnectAgents: agentsWs.reconnect,
    reconnectSearch: searchWs.reconnect,
    
    // Send messages
    sendToAgents: agentsWs.sendMessage,
    sendToSearch: searchWs.sendMessage,
    
    // Overall status
    isFullyConnected: walletWs.isConnected && agentsWs.isConnected && searchWs.isConnected,
    hasAnyConnection: walletWs.isConnected || agentsWs.isConnected || searchWs.isConnected
  }
}
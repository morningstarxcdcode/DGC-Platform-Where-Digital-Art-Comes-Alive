import { useState, useCallback, useEffect, useRef } from 'react'
import { useWallet } from '../hooks/useWallet.jsx'
import { useAgentsWebSocket, useRealTimeData } from '../hooks/useWebSocket.jsx'
import SystemStatus from './SystemStatus.jsx'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/**
 * Professional AI Agents Studio Dashboard
 * 
 * Revolutionary 7-Block Multi-Agent AI System with advanced UI design
 * Based on the professional design from frontend degines/ai_agents_dashboard
 * 
 * Features:
 * - 7 AI agents with professional card design
 * - Neural Chain, Parallel Grid, Single Agent execution modes
 * - Real-time progress tracking with visual indicators
 * - Workflow composer with chain topology
 * - Live execution log with status tracking
 * - Professional dark theme with neon accents
 * - Resource estimation and GPU requirements
 * - Preset management with persistence
 * 
 * Validates: Requirements 14.1-14.10, 16.1-16.10
 * Implements: Tasks 23.1-23.8, 24.1-24.7, 29.1-29.5
 */

const AGENTS = [
  { 
    id: 'IMAGE', 
    name: 'Image Gen', 
    icon: 'image',
    description: 'VISUAL_SYNTH', 
    fullDescription: 'Creates pictures from descriptions',
    version: 'v4.2.0',
    status: 'ready',
    estimatedTime: '5-15s', 
    gpuRequired: true,
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  { 
    id: 'TEXT', 
    name: 'Text Gen', 
    icon: 'article',
    description: 'LANG_PROCESSOR', 
    fullDescription: 'Writes stories and descriptions',
    version: 'LLM-70B',
    status: 'ready',
    estimatedTime: '2-5s', 
    gpuRequired: false,
    bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  { 
    id: 'MUSIC', 
    name: 'Music Gen', 
    icon: 'music_note',
    description: 'AUDIO_SYNTH', 
    fullDescription: 'Composes music for your NFTs',
    version: 'AUDIO-X',
    status: 'sleeping',
    estimatedTime: '10-30s', 
    gpuRequired: true,
    bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  { 
    id: 'DNA', 
    name: 'DNA Agent', 
    icon: 'biotech',
    description: 'EVO_LOGIC', 
    fullDescription: 'Evolves your content over time',
    version: 'EVO_V1',
    status: 'ready',
    estimatedTime: '1-3s', 
    gpuRequired: false,
    bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  { 
    id: 'EMOTION', 
    name: 'Emotion', 
    icon: 'mood',
    description: 'SENTIMENT', 
    fullDescription: 'Responds to your feelings',
    version: 'SENTI_NET',
    status: 'ready',
    estimatedTime: '2-5s', 
    gpuRequired: false,
    bgGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  { 
    id: 'SEARCH', 
    name: 'Search', 
    icon: 'search',
    description: 'WEB_RETRIEVAL', 
    fullDescription: 'Finds blockchain data instantly',
    version: 'OFFLINE',
    status: 'offline',
    estimatedTime: '1-2s', 
    gpuRequired: false,
    bgGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  { 
    id: 'ANALYTICS', 
    name: 'Analytics', 
    icon: 'analytics',
    description: 'DATA_PROCESSOR', 
    fullDescription: 'Tracks your portfolio performance',
    version: 'ANALYTICS_V2',
    status: 'ready',
    estimatedTime: '2-4s', 
    gpuRequired: false,
    bgGradient: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
  }
]

const EXECUTION_LOGS = [
  { id: '#8922', type: 'Chain:Img→Emo', status: 'SUCCESS', time: '00:02:15', latency: '24ms' },
  { id: '#8921', type: 'Par:Text+Music', status: 'RUNNING', time: '00:15:32', latency: 'Processing...', progress: 65 },
  { id: '#8920', type: 'Sgl:DNA_Agent', status: 'FAILED', time: '01:04:11', latency: 'Err: Timeout 5002' },
  { id: '#8919', type: 'Chain:Search→Txt', status: 'SUCCESS', time: '03:22:45', latency: '112ms' }
]

function AgentDashboard() {
  const { address, isConnected } = useWallet()
  const [selectedAgents, setSelectedAgents] = useState([])
  const [executionMode, setExecutionMode] = useState('neural-chain')
  const [inputData, setInputData] = useState({ prompt: '', query: '' })
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState({})
  const [results, setResults] = useState(null)
  const [presets, setPresets] = useState([])
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [agentToggles, setAgentToggles] = useState({})
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleConfig, setScheduleConfig] = useState({ enabled: false, interval: 'daily', time: '09:00' })
  const [resourceEstimate, setResourceEstimate] = useState(null)
  const [executionLogs, setExecutionLogs] = useState(EXECUTION_LOGS)
  const [systemStatus, setSystemStatus] = useState({ load: 3, network: '12ms' })
  const [showSystemStatus, setShowSystemStatus] = useState(false)
  const executionIdRef = useRef(null)

  // Real-time WebSocket integration
  const {
    agentStatus,
    agentsConnected,
    sendToAgents
  } = useRealTimeData(address)

  const agentsWs = useAgentsWebSocket({
    onMessage: (data) => {
      switch (data.type) {
        case 'agent_progress':
          setProgress(prev => ({
            ...prev,
            [data.agent_id]: data.progress
          }))
          break
        case 'agent_complete':
          setProgress(prev => ({
            ...prev,
            [data.agent_id]: 100
          }))
          setResults(prev => ({
            ...prev,
            [data.agent_id]: data.result
          }))
          break
        case 'execution_complete':
          setIsRunning(false)
          setExecutionLogs(prev => [{
            id: `#${Date.now()}`,
            type: data.execution_type,
            status: 'SUCCESS',
            time: new Date().toLocaleTimeString(),
            latency: `${data.total_time}ms`
          }, ...prev.slice(0, 9)])
          break
        case 'execution_error':
          setIsRunning(false)
          setExecutionLogs(prev => [{
            id: `#${Date.now()}`,
            type: data.execution_type,
            status: 'FAILED',
            time: new Date().toLocaleTimeString(),
            latency: `Err: ${data.error}`
          }, ...prev.slice(0, 9)])
          break
      }
    }
  })

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('dgc_agent_config')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setSelectedAgents(config.selectedAgents || ['IMAGE', 'DNA', 'EMOTION'])
        setAgentToggles(config.agentToggles || {})
        setExecutionMode(config.executionMode || 'neural-chain')
      } catch (e) {
        console.error('Error loading saved config:', e)
      }
    } else {
      // Default selection for demo
      setSelectedAgents(['IMAGE', 'DNA', 'EMOTION'])
    }
    fetchPresets()
  }, [])

  // Save configuration when it changes
  useEffect(() => {
    const config = { selectedAgents, agentToggles, executionMode }
    localStorage.setItem('dgc_agent_config', JSON.stringify(config))
  }, [selectedAgents, agentToggles, executionMode])

  // Calculate resource estimate when selection changes
  useEffect(() => {
    if (selectedAgents.length === 0) {
      setResourceEstimate(null)
      return
    }

    const agentsToRun = executionMode === 'parallel-grid' ? AGENTS : AGENTS.filter(a => selectedAgents.includes(a.id))
    const totalTime = agentsToRun.reduce((acc, agent) => {
      const [min, max] = agent.estimatedTime.replace('s', '').split('-').map(Number)
      return acc + (min + max) / 2
    }, 0)
    const gpuRequired = agentsToRun.some(a => a.gpuRequired)

    setResourceEstimate({
      estimatedTime: `${Math.round(totalTime)}s`,
      gpuRequired,
      agentCount: agentsToRun.length
    })
  }, [selectedAgents, executionMode])

  const fetchPresets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/agents/presets`)
      setPresets(response.data.presets || [])
    } catch (err) {
      console.error('Error fetching presets:', err)
    }
  }

  const handleAgentToggle = useCallback((agentId) => {
    setSelectedAgents(prev => {
      if (prev.includes(agentId)) {
        return prev.filter(id => id !== agentId)
      }
      return [...prev, agentId]
    })
  }, [])

  const handleMasterToggle = useCallback((enabled) => {
    if (enabled) {
      setSelectedAgents(AGENTS.map(a => a.id))
    } else {
      setSelectedAgents([])
    }
  }, [])

  const connectProgressWebSocket = useCallback((executionId) => {
    try {
      const wsUrl = API_BASE.replace('http', 'ws') + `/ws/agents/${executionId}`
      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'progress') {
            setProgress(prev => ({
              ...prev,
              [data.agent_type]: {
                status: data.status,
                progress: data.progress,
                step: data.step
              }
            }))
          } else if (data.type === 'result') {
            setProgress(prev => ({
              ...prev,
              [data.agent_type]: {
                status: 'COMPLETED',
                progress: 100,
                step: 'Complete!',
                result: data.result
              }
            }))
          } else if (data.type === 'error') {
            setProgress(prev => ({
              ...prev,
              [data.agent_type]: {
                status: 'FAILED',
                progress: 0,
                step: 'Failed',
                error: data.error
              }
            }))
          }
        } catch (e) {
          console.error('WebSocket message parse error:', e)
        }
      }

      wsRef.current.onclose = () => {
        console.log('Agent progress WebSocket closed')
      }
    } catch (e) {
      console.error('WebSocket connection error:', e)
    }
  }, [])

  const executeAgents = async () => {
    if (selectedAgents.length === 0 && executionMode !== 'parallel-grid') {
      alert('Please select at least one agent')
      return
    }

    setIsRunning(true)
    setResults(null)
    setProgress({})

    // Initialize progress for selected agents
    const agentsToRun = executionMode === 'parallel-grid' ? AGENTS.map(a => a.id) : selectedAgents
    const initialProgress = {}
    agentsToRun.forEach(id => {
      initialProgress[id] = { status: 'RUNNING', progress: 0, step: 'Starting...' }
    })
    setProgress(initialProgress)

    // Add new execution log
    const newLog = {
      id: `#${Math.floor(Math.random() * 9999)}`,
      type: executionMode === 'neural-chain' ? `Chain:${selectedAgents.slice(0,2).join('→')}` : 
            executionMode === 'parallel-grid' ? 'Par:All_Agents' : 
            `Sgl:${selectedAgents[0]}`,
      status: 'RUNNING',
      time: '00:00:00',
      latency: 'Processing...',
      progress: 0
    }
    setExecutionLogs(prev => [newLog, ...prev.slice(0, 3)])

    try {
      const response = await axios.post(`${API_BASE}/api/agents/execute`, {
        agent_types: executionMode === 'parallel-grid' ? null : selectedAgents,
        input_data: {
          prompt: inputData.prompt,
          query: inputData.query,
          address: address
        },
        mode: executionMode.toUpperCase().replace('-', '_')
      })

      // Connect WebSocket for real-time progress
      if (response.data.execution_id) {
        executionIdRef.current = response.data.execution_id
        connectProgressWebSocket(response.data.execution_id)
      }

      // Update progress to completed
      const completedProgress = {}
      Object.keys(response.data.agents || {}).forEach(agentType => {
        const agentResult = response.data.agents[agentType]
        completedProgress[agentType] = {
          status: agentResult.status,
          progress: 100,
          step: 'Complete!',
          result: agentResult.result
        }
      })
      setProgress(completedProgress)
      setResults(response.data)

      // Update execution log
      setExecutionLogs(prev => prev.map(log => 
        log.id === newLog.id 
          ? { ...log, status: 'SUCCESS', latency: `${response.data.total_time_ms}ms` }
          : log
      ))
    } catch (err) {
      console.error('Agent execution error:', err)
      
      // Update execution log with failure
      setExecutionLogs(prev => prev.map(log => 
        log.id === newLog.id 
          ? { ...log, status: 'FAILED', latency: 'Error occurred' }
          : log
      ))
      
      alert('Agent execution failed: ' + (err.response?.data?.detail || err.message))
    } finally {
      setIsRunning(false)
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }

  const cancelExecution = async () => {
    if (!executionIdRef.current) return

    try {
      await axios.delete(`${API_BASE}/api/agents/execution/${executionIdRef.current}`)
      setIsRunning(false)
      setProgress({})
      if (wsRef.current) {
        wsRef.current.close()
      }
    } catch (err) {
      console.error('Error cancelling execution:', err)
    }
  }

  const savePreset = async () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name')
      return
    }

    try {
      const response = await axios.post(`${API_BASE}/api/agents/presets`, {
        name: presetName,
        description: `Saved preset with ${selectedAgents.length} agents`,
        enabled_agents: selectedAgents,
        parameters: {},
        chain_config: executionMode === 'neural-chain' ? selectedAgents : null
      })

      setPresets(prev => [...prev, response.data.preset])
      setShowPresetModal(false)
      setPresetName('')
      alert('Preset saved!')
    } catch (err) {
      console.error('Error saving preset:', err)
      alert('Failed to save preset')
    }
  }

  const loadPreset = (preset) => {
    setSelectedAgents(preset.enabled_agents)
    if (preset.chain_config) {
      setExecutionMode('neural-chain')
    }
  }

  const getAgentStatus = (agentId) => {
    const agentProgress = progress[agentId]
    if (!agentProgress) {
      const agent = AGENTS.find(a => a.id === agentId)
      return agent?.status || 'ready'
    }
    return agentProgress.status.toLowerCase()
  }

  const getProgressPercent = (agentId) => {
    return progress[agentId]?.progress || 0
  }

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'ready': return { color: '#10b981', icon: '●' }
      case 'running': return { color: '#f59e0b', icon: '◐' }
      case 'completed': return { color: '#10b981', icon: '●' }
      case 'failed': return { color: '#ef4444', icon: '●' }
      case 'sleeping': return { color: '#f59e0b', icon: '●' }
      case 'offline': return { color: '#6b7280', icon: '●' }
      default: return { color: '#6b7280', icon: '●' }
    }
  }

  if (!isConnected) {
    return (
      <div className="agent-dashboard-studio not-connected">
        <div className="connect-prompt">
          <div className="icon">🤖</div>
          <h3>Connect Wallet to Access AI Agents Studio</h3>
          <p>Connect your wallet to access the revolutionary 7-block multi-agent AI system</p>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-dashboard-studio">
      {/* Professional Header */}
      <div className="studio-header">
        <div className="header-left">
          <div className="breadcrumb">
            <span className="material-symbols-outlined">science</span>
            <span className="separator">/</span>
            <h2>STUDIO CONSOLE</h2>
          </div>
        </div>
        
        <div className="header-right">
          <div className="system-stats">
            <div className="stat-item">
              <span className="stat-label">System Load</span>
              <div className="load-bars">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`load-bar ${i < systemStatus.load ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-label">Network</span>
              <span className="stat-value network">{systemStatus.network}</span>
            </div>
          </div>
          
          <div className="search-container">
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="SEARCH_MODULES..." 
              className="search-input"
            />
          </div>
          
          <button className="notification-btn">
            <span className="material-symbols-outlined">notifications</span>
            <span className="notification-dot"></span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="studio-content">
        <div className="content-header">
          <div className="title-section">
            <h1>AI AGENTS STUDIO</h1>
            <span className="beta-badge">BETA</span>
            <p>Orchestrate multiple AI agents for advanced creation workflows.</p>
          </div>
          
          <div className="header-actions">
            <button className="docs-btn">
              <span className="material-symbols-outlined">book</span>
              DOCS_V2
            </button>
          </div>
        </div>

        {/* Available Modules Section */}
        <section className="modules-section">
          <div className="section-header">
            <h3>
              <span className="indicator-dot"></span>
              Available Modules
            </h3>
            <div className="view-controls">
              <button className="view-btn active">
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button className="view-btn">
                <span className="material-symbols-outlined">list</span>
              </button>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="agents-grid-studio">
            {AGENTS.map(agent => {
              const status = getAgentStatus(agent.id)
              const progressPct = getProgressPercent(agent.id)
              const isSelected = selectedAgents.includes(agent.id)
              const statusInfo = getStatusIndicator(status)
              
              return (
                <div 
                  key={agent.id}
                  className={`agent-card-studio ${isSelected ? 'selected' : ''} ${status}`}
                  onClick={() => !isRunning && handleAgentToggle(agent.id)}
                >
                  <div className="status-indicator">
                    <span 
                      className="status-dot"
                      style={{ color: statusInfo.color }}
                    >
                      {statusInfo.icon}
                    </span>
                  </div>
                  
                  <div 
                    className="agent-image"
                    style={{ background: agent.bgGradient }}
                  >
                    <div className="image-overlay"></div>
                    <div className="version-badge">{agent.version}</div>
                  </div>
                  
                  <div className="agent-details">
                    <div className="agent-info">
                      <h4>{agent.name}</h4>
                      <p>{agent.description}</p>
                    </div>
                    
                    <button 
                      className={`configure-btn ${status === 'offline' ? 'disabled' : ''}`}
                      disabled={status === 'offline'}
                    >
                      {status === 'sleeping' ? 'Wake' : 
                       status === 'offline' ? 'Disabled' : 'Configure'}
                    </button>
                  </div>
                  
                  {status === 'running' && (
                    <div className="agent-progress">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="workflow-section">
          <div className="workflow-container">
            {/* Workflow Composer */}
            <div className="workflow-composer">
              <div className="composer-header">
                <div className="header-title">
                  <span className="material-symbols-outlined">hub</span>
                  <h3>Workflow Composer</h3>
                </div>
                <div className="composer-actions">
                  <button className="action-btn">
                    <span className="material-symbols-outlined">save</span>
                    Save
                  </button>
                  <button className="action-btn">
                    <span className="material-symbols-outlined">upload</span>
                    Load
                  </button>
                </div>
              </div>
              
              <div className="composer-content">
                <div className="execution-protocols">
                  <label className="protocol-label">Execution Protocol</label>
                  <div className="protocol-options">
                    <label className="protocol-option">
                      <input 
                        type="radio" 
                        name="mode" 
                        value="single-agent"
                        checked={executionMode === 'single-agent'}
                        onChange={(e) => setExecutionMode(e.target.value)}
                      />
                      <div className="option-content">
                        <span className="option-title">Single Agent</span>
                        <p className="option-desc">Isolated task execution</p>
                      </div>
                    </label>
                    
                    <label className="protocol-option">
                      <input 
                        type="radio" 
                        name="mode" 
                        value="parallel-grid"
                        checked={executionMode === 'parallel-grid'}
                        onChange={(e) => setExecutionMode(e.target.value)}
                      />
                      <div className="option-content">
                        <span className="option-title">Parallel Grid</span>
                        <p className="option-desc">Concurrent processing</p>
                      </div>
                    </label>
                    
                    <label className="protocol-option">
                      <input 
                        type="radio" 
                        name="mode" 
                        value="neural-chain"
                        checked={executionMode === 'neural-chain'}
                        onChange={(e) => setExecutionMode(e.target.value)}
                      />
                      <div className="option-content">
                        <span className="option-title">Neural Chain</span>
                        <p className="option-desc">Sequential dependency</p>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className="chain-topology">
                  <div className="topology-header">
                    <label>Chain Topology</label>
                    <span className="system-ready">
                      <span className="ready-dot"></span>
                      SYSTEM READY
                    </span>
                  </div>
                  
                  <div className="topology-canvas">
                    <div className="chain-flow">
                      <div className="flow-start">
                        <span className="material-symbols-outlined">start</span>
                      </div>
                      
                      {selectedAgents.slice(0, 3).map((agentId, index) => {
                        const agent = AGENTS.find(a => a.id === agentId)
                        return (
                          <div key={agentId} className="flow-sequence">
                            <div className="flow-connector"></div>
                            <div className="flow-node">
                              <div className="node-glow"></div>
                              <div className="node-content">
                                <div className="node-icon">
                                  <span className="material-symbols-outlined">{agent.icon}</span>
                                </div>
                                <div className="node-info">
                                  <span className="node-name">{agent.name}</span>
                                  <span className="node-id">Node_{String(index + 1).padStart(2, '0')}</span>
                                </div>
                              </div>
                            </div>
                            {index < selectedAgents.slice(0, 3).length - 1 && (
                              <div className="data-flow">
                                <div className="flow-arrow"></div>
                                <span className="flow-label">JSON</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      <div className="flow-output">
                        <div className="flow-connector"></div>
                        <div className="output-node">
                          <div className="node-icon">
                            <span className="material-symbols-outlined">output</span>
                          </div>
                          <div className="node-info">
                            <span className="node-name">Output</span>
                            <span className="node-id">Final_Artifact</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="execute-workflow-btn"
                    onClick={executeAgents}
                    disabled={isRunning || (selectedAgents.length === 0 && executionMode !== 'parallel-grid')}
                  >
                    <div className="btn-shimmer"></div>
                    <span className="material-symbols-outlined">settings</span>
                    <span>Initialize Workflow Execution</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Execution Log */}
            <div className="execution-log">
              <div className="log-header">
                <h3>
                  <span className="material-symbols-outlined">history</span>
                  Execution Log
                </h3>
                <span className="live-feed-badge">LIVE FEED</span>
              </div>
              
              <div className="log-content">
                <div className="log-table-header">
                  <div className="col-id">ID</div>
                  <div className="col-type">Type</div>
                  <div className="col-status">Status</div>
                </div>
                
                <div className="log-entries">
                  {executionLogs.map(log => (
                    <div key={log.id} className={`log-entry ${log.status.toLowerCase()}`}>
                      <div className="entry-header">
                        <span className="entry-id">{log.id}</span>
                        <span className="entry-time">{log.time}</span>
                      </div>
                      <div className="entry-content">
                        <div className="entry-info">
                          <span className="entry-type">{log.type}</span>
                          <span className="entry-latency">{log.latency}</span>
                        </div>
                        <span className={`entry-status ${log.status.toLowerCase()}`}>
                          {log.status === 'RUNNING' && <span className="status-pulse"></span>}
                          {log.status}
                        </span>
                      </div>
                      {log.progress && (
                        <div className="entry-progress">
                          <div 
                            className="progress-bar"
                            style={{ width: `${log.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <button className="view-full-logs-btn">
                  View Full Logs
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Input Modal for Execution */}
      {showPresetModal && (
        <div className="modal-overlay" onClick={() => setShowPresetModal(false)}>
          <div className="modal-studio" onClick={e => e.stopPropagation()}>
            <h3>💾 Save Preset</h3>
            <div className="form-group">
              <label>Preset Name</label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name..."
              />
            </div>
            <div className="preset-preview">
              <p>Selected Agents: {selectedAgents.length}</p>
              <p>Mode: {executionMode}</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowPresetModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={savePreset}>
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentDashboard

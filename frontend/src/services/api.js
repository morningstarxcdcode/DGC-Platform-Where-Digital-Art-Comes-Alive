import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    console.error(`[API Error] ${message}`)
    return Promise.reject(error)
  }
)

// Generation API
export const generationAPI = {
  // Generate AI content
  async generate(prompt, contentType, creatorAddress, options = {}) {
    const response = await api.post('/api/generate', {
      prompt,
      content_type: contentType,
      creator_address: creatorAddress,
      seed: options.seed,
      parameters: options.parameters
    })
    return response.data
  },

  // Get generation job status
  async getStatus(jobId) {
    const response = await api.get(`/api/generate/${jobId}`)
    return response.data
  },

  // Get generated content
  async getContent(jobId) {
    const response = await api.get(`/api/generate/${jobId}/content`, {
      responseType: 'blob'
    })
    return response.data
  }
}

// IPFS API
export const ipfsAPI = {
  // Upload content to IPFS
  async upload(content, options = {}) {
    // If content is a File or Blob, convert to base64
    let contentData = content
    if (content instanceof Blob) {
      contentData = await blobToBase64(content)
    }

    const response = await api.post('/api/upload', {
      content: contentData,
      content_type: options.contentType || 'application/octet-stream',
      pin: options.pin !== false
    })
    return response.data
  },

  // Get content from IPFS
  async get(cid) {
    const response = await api.get(`/api/content/${cid}`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Pin content
  async pin(cid) {
    const response = await api.post(`/api/pin/${cid}`)
    return response.data
  },

  // Unpin content
  async unpin(cid) {
    const response = await api.delete(`/api/pin/${cid}`)
    return response.data
  }
}

// NFT API
export const nftAPI = {
  // List NFTs with filters
  async list(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page)
    if (filters.pageSize) params.append('page_size', filters.pageSize)
    if (filters.contentType) params.append('content_type', filters.contentType)
    if (filters.creator) params.append('creator', filters.creator)
    if (filters.owner) params.append('owner', filters.owner)
    if (filters.minPrice) params.append('min_price', filters.minPrice)
    if (filters.maxPrice) params.append('max_price', filters.maxPrice)
    if (filters.sort) params.append('sort', filters.sort)

    const response = await api.get(`/api/nfts?${params}`)
    return response.data
  },

  // Get single NFT
  async get(tokenId) {
    const response = await api.get(`/api/nfts/${tokenId}`)
    return response.data
  },

  // Get NFT provenance
  async getProvenance(tokenId) {
    const response = await api.get(`/api/nfts/${tokenId}/provenance`)
    return response.data
  },

  // Index a new NFT (after minting on-chain)
  async index(nftData) {
    const response = await api.post('/api/nfts', nftData)
    return response.data
  },

  // Update NFT metadata
  async update(tokenId, updates) {
    const response = await api.patch(`/api/nfts/${tokenId}`, updates)
    return response.data
  }
}

// Activity API
export const activityAPI = {
  // Get activity for an address
  async getByAddress(address, options = {}) {
    const params = new URLSearchParams()
    params.append('address', address)
    if (options.type) params.append('type', options.type)
    if (options.limit) params.append('limit', options.limit)

    const response = await api.get(`/api/activity?${params}`)
    return response.data
  },

  // Get activity for a token
  async getByToken(tokenId, options = {}) {
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit)

    const response = await api.get(`/api/nfts/${tokenId}/activity?${params}`)
    return response.data
  }
}

// Content DNA API
export const dnaAPI = {
  // Generate DNA from prompt
  async generate(prompt, creatorAddress, options = {}) {
    const response = await api.post('/api/dna/generate', {
      prompt,
      creator_address: creatorAddress,
      seed: options.seed
    })
    return response.data
  },

  // Breed two DNA sequences
  async breed(parent1Hash, parent2Hash, breederId) {
    const response = await api.post('/api/dna/breed', {
      parent1_hash: parent1Hash,
      parent2_hash: parent2Hash,
      breeder_id: breederId
    })
    return response.data
  },

  // Evolve DNA based on environmental factors
  async evolve(dnaHash, environmentFactors, generations = 1) {
    const response = await api.post('/api/dna/evolve', {
      dna_hash: dnaHash,
      environment_factors: environmentFactors,
      generations
    })
    return response.data
  },

  // Get DNA by hash
  async get(dnaHash) {
    const response = await api.get(`/api/dna/${dnaHash}`)
    return response.data
  },

  // Check compatibility between two DNA sequences
  async checkCompatibility(hash1, hash2) {
    const response = await api.get(`/api/dna/compatibility/${hash1}/${hash2}`)
    return response.data
  }
}

// Emotional Intelligence API
export const emotionAPI = {
  // Analyze emotion from facial data or text
  async analyze(data) {
    const response = await api.post('/api/emotion/analyze', data)
    return response.data
  },

  // Adapt content based on emotion
  async adaptContent(contentId, emotionState, adaptationType = 'visual') {
    const response = await api.post('/api/emotion/adapt', {
      content_id: contentId,
      emotion_state: emotionState,
      adaptation_type: adaptationType
    })
    return response.data
  },

  // Create emotion profile for content
  async createProfile(contentId, baseEmotions, responsiveness = 0.8) {
    const response = await api.post('/api/emotion/profile', {
      content_id: contentId,
      base_emotions: baseEmotions,
      responsiveness
    })
    return response.data
  },

  // Get emotion profile for content
  async getProfile(contentId) {
    const response = await api.get(`/api/emotion/profile/${contentId}`)
    return response.data
  },

  // Record emotional interaction
  async recordInteraction(contentId, emotionState, duration) {
    const response = await api.post(`/api/emotion/record/${contentId}`, {
      emotion_state: emotionState,
      duration
    })
    return response.data
  },

  // Get emotional resonance score
  async getResonance(contentId) {
    const response = await api.get(`/api/emotion/resonance/${contentId}`)
    return response.data
  }
}

// Health check
export async function checkHealth() {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

// Helper function to convert Blob to base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default api

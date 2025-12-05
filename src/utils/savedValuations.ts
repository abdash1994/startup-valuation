/**
 * Local Storage Persistence Layer for Saved Valuations
 * 
 * Used for:
 * 1. Non-authenticated users to save valuations locally
 * 2. Quick access without network calls
 * 3. Offline capability
 */

export type SavedValuation = {
  id: string
  companyName: string
  stage: string
  createdAt: string
  updatedAt?: string
  // Key metrics
  arr: number
  monthlyGrowth: number
  tam: number
  grossMargin: number
  netRetention: number
  burnMultiple: number
  teamStrength: number
  differentiation: number
  // Computed valuations
  bear: number
  base: number
  bull: number
  revenueMultiple: number
  confidence: number
  // Optional insights snapshot
  insights?: string[]
}

const STORAGE_KEY = 'startup-valuations'

/**
 * Generate a unique ID for new valuations
 */
function generateId(): string {
  return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all saved valuations from localStorage
 */
export function getSavedValuations(): SavedValuation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    // Validate array
    if (!Array.isArray(parsed)) return []
    return parsed as SavedValuation[]
  } catch (error) {
    console.warn('Error reading saved valuations:', error)
    return []
  }
}

/**
 * Get a single valuation by ID
 */
export function getValuationById(id: string): SavedValuation | null {
  const valuations = getSavedValuations()
  return valuations.find(v => v.id === id) || null
}

/**
 * Save a new valuation to localStorage
 */
export function saveValuation(
  valuation: Omit<SavedValuation, 'id' | 'createdAt'>
): SavedValuation {
  const valuations = getSavedValuations()
  
  const newValuation: SavedValuation = {
    ...valuation,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  
  valuations.unshift(newValuation) // Add to beginning (most recent first)
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valuations))
  } catch (error) {
    console.error('Error saving valuation:', error)
    throw new Error('Failed to save valuation. Storage may be full.')
  }
  
  return newValuation
}

/**
 * Update an existing valuation
 */
export function updateValuation(
  id: string,
  updates: Partial<Omit<SavedValuation, 'id' | 'createdAt'>>
): SavedValuation | null {
  const valuations = getSavedValuations()
  const index = valuations.findIndex(v => v.id === id)
  
  if (index === -1) return null
  
  const updated: SavedValuation = {
    ...valuations[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  valuations[index] = updated
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valuations))
  } catch (error) {
    console.error('Error updating valuation:', error)
    throw new Error('Failed to update valuation.')
  }
  
  return updated
}

/**
 * Delete a valuation by ID
 */
export function deleteValuation(id: string): boolean {
  const valuations = getSavedValuations()
  const filtered = valuations.filter(v => v.id !== id)
  
  if (filtered.length === valuations.length) {
    return false // Nothing was deleted
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting valuation:', error)
    return false
  }
  
  return true
}

/**
 * Clear all saved valuations
 */
export function clearAllValuations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing valuations:', error)
  }
}

/**
 * Export valuations as JSON (for backup)
 */
export function exportValuationsAsJson(): string {
  const valuations = getSavedValuations()
  return JSON.stringify(valuations, null, 2)
}

/**
 * Import valuations from JSON
 */
export function importValuationsFromJson(json: string): number {
  try {
    const imported = JSON.parse(json)
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array')
    }
    
    const existing = getSavedValuations()
    const existingIds = new Set(existing.map(v => v.id))
    
    // Only add new valuations (by ID)
    const newValuations = imported.filter(v => !existingIds.has(v.id))
    const combined = [...newValuations, ...existing]
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined))
    return newValuations.length
  } catch (error) {
    console.error('Error importing valuations:', error)
    throw new Error('Failed to import valuations. Invalid format.')
  }
}


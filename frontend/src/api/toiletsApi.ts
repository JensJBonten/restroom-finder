import type { Toilet } from '../types/Toilet'

// Vite embeds this URL at build time; changing it requires rebuilding the frontend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export async function fetchToilets(signal?: AbortSignal): Promise<Toilet[]> {
  const response = await fetch(`${API_BASE_URL}/api/toilets`, { signal })

  if (!response.ok) {
    throw new Error(`Failed to fetch toilets: ${response.status}`)
  }

  return response.json()
}
import type { Toilet } from '../types/Toilet'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Retrieves toilets from the Toilapp backend.
 *
 * @param signal optionally cancels the request when the component unmounts
 * @returns toilets returned by the backend
 * @throws Error when the backend responds with an unsuccessful status
 */
export async function fetchToilets(
  signal?: AbortSignal,
): Promise<Toilet[]> {
  const response = await fetch(`${API_BASE_URL}/api/toilets`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch toilets: ${response.status}`)
  }

  return response.json()
}
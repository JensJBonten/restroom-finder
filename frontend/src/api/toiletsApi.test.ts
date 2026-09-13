import { afterEach, describe, expect, it, vi } from 'vitest'
import { toilets } from '../test/fixtures'
import { fetchToilets } from './toiletsApi'

describe('fetchToilets', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns toilets from a successful response', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify(toilets), { status: 200 }),
      )

    await expect(fetchToilets()).resolves.toEqual(toilets)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/toilets',
      { signal: undefined },
    )
  })

  it('preserves nullable API fields', async () => {
    const responseToilets = [{ ...toilets[1], name: null }]
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(responseToilets), { status: 200 }),
    )

    await expect(fetchToilets()).resolves.toEqual(responseToilets)
  })

  it('throws an error containing the unsuccessful HTTP status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 503 }),
    )

    await expect(fetchToilets()).rejects.toThrow(
      'Failed to fetch toilets: 503',
    )
  })

  it('passes a cancellation signal to fetch', async () => {
    const controller = new AbortController()
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(
        new DOMException('The request was aborted', 'AbortError'),
      )

    controller.abort()

    await expect(fetchToilets(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/toilets',
      { signal: controller.signal },
    )
  })
})
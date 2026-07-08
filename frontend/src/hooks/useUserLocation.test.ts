import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUserLocation } from './useUserLocation'

function createPosition(
  latitude: number,
  longitude: number,
): GeolocationPosition {
  return {
    coords: {
      latitude,
      longitude,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  } as GeolocationPosition
}

function createGeolocationError(
  code: number,
  message: string,
): GeolocationPositionError {
  return {
    code,
    message,
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError
}

function mockGeolocation(
  getCurrentPosition: Geolocation['getCurrentPosition'],
) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition,
    },
  })
}

describe('useUserLocation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns coordinates when geolocation succeeds', async () => {
    mockGeolocation(
      vi.fn((successCallback: PositionCallback) => {
        successCallback(createPosition(59.9139, 10.7522))
      }),
    )

    const { result } = renderHook(() => useUserLocation())

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(result.current.coordinates).toEqual({
      latitude: 59.9139,
      longitude: 10.7522,
    })
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns denied when the user rejects permission', async () => {
    mockGeolocation(
      vi.fn(
        (
          _successCallback: PositionCallback,
          errorCallback: PositionErrorCallback,
        ) => {
          errorCallback(
            createGeolocationError(1, 'Permission denied'),
          )
        },
      ),
    )

    const { result } = renderHook(() => useUserLocation())

    await waitFor(() => {
      expect(result.current.status).toBe('denied')
    })

    expect(result.current.coordinates).toBeNull()
    expect(result.current.errorMessage).toContain('denied')
  })

  it('returns unsupported when geolocation is unavailable', async () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    })

    const { result } = renderHook(() => useUserLocation())

    await waitFor(() => {
      expect(result.current.status).toBe('unsupported')
    })

    expect(result.current.coordinates).toBeNull()
  })

  it('does not update state after unmounting', () => {
    let capturedSuccessCallback: PositionCallback | undefined

    mockGeolocation(
      vi.fn((receivedSuccessCallback: PositionCallback) => {
        capturedSuccessCallback = receivedSuccessCallback
      }),
    )

    const { result, unmount } = renderHook(() => useUserLocation())

    expect(result.current.status).toBe('loading')
    expect(capturedSuccessCallback).toBeDefined()

    unmount()

    /*
     * TypeScript cannot prove that the callback was assigned inside
     * the mock function, so we narrow it explicitly after checking it.
     */
    const triggerSuccessCallback =
      capturedSuccessCallback as PositionCallback

    triggerSuccessCallback(createPosition(59.9139, 10.7522))

    expect(result.current.status).toBe('loading')
  })
})
import { useEffect, useState } from 'react'
import type { Coordinates } from '../types/Coordinates'

export type UserLocationStatus =
  | 'loading'
  | 'success'
  | 'denied'
  | 'unsupported'
  | 'error'

export type UserLocationResult = {
  coordinates: Coordinates | null
  status: UserLocationStatus
  errorMessage: string | null
}

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 30_000,
}

function getLocationErrorDetails(
  error: GeolocationPositionError,
): Pick<UserLocationResult, 'status' | 'errorMessage'> {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        status: 'denied',
        errorMessage:
          'Du har ikke gitt tilgang til posisjonen din. Viser toaletter i Oslo i stedet.',
      }

    case error.POSITION_UNAVAILABLE:
      return {
        status: 'error',
        errorMessage:
          'Kunne ikke finne posisjonen din.',
      }

    case error.TIMEOUT:
      return {
        status: 'error',
        errorMessage:
          'Det tok for lang tid å finne posisjonen din.',
      }

    default:
      return {
        status: 'error',
        errorMessage:
          'Det oppstod en uventet feil da vi prøvde å finne posisjonen din.',
      }
  }
}

// Null coordinates let the map fall back to Oslo so toilets remain discoverable.
export function useUserLocation(): UserLocationResult {
  const [locationResult, setLocationResult] =
    useState<UserLocationResult>(() => {
      const supportsGeolocation =
        typeof navigator !== 'undefined' &&
        !!navigator.geolocation

      return {
        coordinates: null,
        status: supportsGeolocation ? 'loading' : 'unsupported',
        errorMessage: supportsGeolocation
          ? null
          : 'Nettleseren din støtter ikke posisjonstjenester.',
      }
    })

  useEffect(() => {
    let isSubscribed = true

    if (
      typeof navigator === 'undefined' ||
      !navigator.geolocation
    ) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isSubscribed) {
          return
        }

        setLocationResult({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          status: 'success',
          errorMessage: null,
        })
      },
      (error) => {
        if (!isSubscribed) {
          return
        }

        const errorDetails = getLocationErrorDetails(error)

        setLocationResult({
          coordinates: null,
          ...errorDetails,
        })
      },
      GEOLOCATION_OPTIONS,
    )

    /*
     * getCurrentPosition does not provide an AbortController-like
     * cancellation method. The flag prevents a late browser callback
     * from updating state after the component has unmounted.
     */
    return () => {
      isSubscribed = false
    }
  }, [])

  return locationResult
}
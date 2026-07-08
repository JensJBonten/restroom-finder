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

/**
 * Converts browser geolocation errors into predictable app state.
 */
function getLocationErrorDetails(
  error: GeolocationPositionError,
): Pick<UserLocationResult, 'status' | 'errorMessage'> {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        status: 'denied',
        errorMessage:
          'Location access was denied. Showing Oslo toilets instead.',
      }

    case error.POSITION_UNAVAILABLE:
      return {
        status: 'error',
        errorMessage:
          'Your current location could not be determined.',
      }

    case error.TIMEOUT:
      return {
        status: 'error',
        errorMessage:
          'Finding your location took too long.',
      }

    default:
      return {
        status: 'error',
        errorMessage:
          'An unexpected location error occurred.',
      }
  }
}

/**
 * Retrieves the user's current position through the browser.
 *
 * The browser controls the permission prompt. The hook exposes a
 * predictable result object so UI components do not need to interact
 * with the Geolocation API directly.
 */

export function useUserLocation(): UserLocationResult {
  const [locationResult, setLocationResult] =
    useState<UserLocationResult>({
      coordinates: null,
      status: 'loading',
      errorMessage: null,
    })

  useEffect(() => {
    let isSubscribed = true

    if (!navigator.geolocation) {
      setLocationResult({
        coordinates: null,
        status: 'unsupported',
        errorMessage:
          'This browser does not support location services.',
      })

      return () => {
        isSubscribed = false
      }
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
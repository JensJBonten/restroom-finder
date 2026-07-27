import type { Coordinates } from '../types/Coordinates'

const GOOGLE_MAPS_DIRECTIONS_URL =
  'https://www.google.com/maps/dir/'

/**
 * Builds  Google Maps directions URL for walking to a destination.
 *
 * Google Maps determines the user's starting point when the link is
 * opened. Toilapp only needs to provide the destination.
 *
 * @param destination geographical coordinates for the toilet
 * @returns Google Maps URL configured for walking directions
 */
export function buildGoogleMapsWalkingUrl(
  destination: Coordinates,
): string {
  const googleMapsUrl = new URL(
    GOOGLE_MAPS_DIRECTIONS_URL,
  )

  googleMapsUrl.searchParams.set('api', '1')
  googleMapsUrl.searchParams.set(
    'destination',
    `${destination.latitude},${destination.longitude}`,
  )
  googleMapsUrl.searchParams.set(
    'travelmode',
    'walking',
  )

  return googleMapsUrl.toString()
}
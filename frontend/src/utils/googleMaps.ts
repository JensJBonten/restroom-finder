import type { Coordinates } from '../types/Coordinates'

const GOOGLE_MAPS_DIRECTIONS_URL = 'https://www.google.com/maps/dir/'

// Google Maps chooses the starting point; Toilapp supplies only the destination.
export function buildGoogleMapsWalkingUrl(destination: Coordinates): string {
  const googleMapsUrl = new URL(GOOGLE_MAPS_DIRECTIONS_URL)

  googleMapsUrl.searchParams.set('api', '1')
  googleMapsUrl.searchParams.set(
    'destination',
    `${destination.latitude},${destination.longitude}`,
  )
  googleMapsUrl.searchParams.set('travelmode', 'walking')

  return googleMapsUrl.toString()
}
import type { Coordinates } from '../types/Coordinates'

const EARTH_RADIUS_METERS = 6_371_000

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Haversine accounts for Earth’s curvature but gives straight-line distance, not a walking route.
export function calculateDistanceInMeters(
  origin: Coordinates,
  destination: Coordinates,
): number {
  const originLatitudeRadians = degreesToRadians(origin.latitude)
  const destinationLatitudeRadians = degreesToRadians(destination.latitude)

  const latitudeDifferenceRadians = degreesToRadians(destination.latitude - origin.latitude)

  const longitudeDifferenceRadians = degreesToRadians(destination.longitude - origin.longitude)

  const haversineValue =
    Math.sin(latitudeDifferenceRadians / 2) ** 2 +
    Math.cos(originLatitudeRadians) *
      Math.cos(destinationLatitudeRadians) *
      Math.sin(longitudeDifferenceRadians / 2) ** 2

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue))

  return EARTH_RADIUS_METERS * angularDistance
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1_000) {
    return `${Math.round(distanceMeters)} m`
  }

  return `${(distanceMeters / 1_000).toFixed(1)} km`
}
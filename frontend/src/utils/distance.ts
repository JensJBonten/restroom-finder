import type { Coordinates } from '../types/Coordinates'

const EARTH_RADIUS_METERS = 6_371_000

/**
 * Converts degrees to radians.
 *
 * JavaScript's trigonometric Math functions expect radians rather
 * than geographical degrees.
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculates the straight-line distance between two coordinates.
 *
 * The Haversine formula accounts for the curvature of the Earth and
 * is accurate enough for short city distances in Toilapp.
 *
 * @param origin starting coordinate, normally the user's position
 * @param destination destination coordinate, normally a toilet
 * @returns distance between the coordinates in meters
 */
export function calculateDistanceInMeters(
  origin: Coordinates,
  destination: Coordinates,
): number {
  const originLatitudeRadians = degreesToRadians(origin.latitude)
  const destinationLatitudeRadians = degreesToRadians(
    destination.latitude,
  )

  const latitudeDifferenceRadians = degreesToRadians(
    destination.latitude - origin.latitude,
  )

  const longitudeDifferenceRadians = degreesToRadians(
    destination.longitude - origin.longitude,
  )

  const haversineValue =
    Math.sin(latitudeDifferenceRadians / 2) ** 2 +
    Math.cos(originLatitudeRadians) *
      Math.cos(destinationLatitudeRadians) *
      Math.sin(longitudeDifferenceRadians / 2) ** 2

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(haversineValue),
      Math.sqrt(1 - haversineValue),
    )

  return EARTH_RADIUS_METERS * angularDistance
}

/**
 * Formats a distance for display in the interface.
 *
 * Distances below one kilometre are shown as rounded m.
 * Longer distances are shown with one km decimal.
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1_000) {
    return `${Math.round(distanceMeters)} m`
  }

  return `${(distanceMeters / 1_000).toFixed(1)} km`
}
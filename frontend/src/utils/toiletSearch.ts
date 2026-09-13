import type { Coordinates } from '../types/Coordinates'
import type { Toilet } from '../types/Toilet'
import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import { calculateDistanceInMeters } from './distance'

export const DEFAULT_SEARCH_RADIUS_METERS = 2_000
export const DEFAULT_MAXIMUM_RESULTS = 6

type NearbyToiletOptions = {
  searchRadiusMeters?: number
  maximumResults?: number
}

// The supplied position is the active search centre, which can be the user’s position or Oslo.
export function findNearbyToilets(
  toilets: Toilet[],
  userLocation: Coordinates,
  options: NearbyToiletOptions = {},
): ToiletDisplayItem[] {
  const {
    searchRadiusMeters = DEFAULT_SEARCH_RADIUS_METERS,
    maximumResults = DEFAULT_MAXIMUM_RESULTS,
  } = options

  return toilets
    .map((toilet): ToiletDisplayItem => {
      const toiletLocation: Coordinates = {
        latitude: toilet.latitude,
        longitude: toilet.longitude,
      }

      return {
        ...toilet,
        distanceMeters: calculateDistanceInMeters(userLocation, toiletLocation),
      }
    })
    .filter(
      (toilet) =>
        toilet.distanceMeters !== undefined && toilet.distanceMeters <= searchRadiusMeters,
    )
    .sort(
      (firstToilet, secondToilet) =>
        (firstToilet.distanceMeters ?? 0) - (secondToilet.distanceMeters ?? 0),
    )
    .slice(0, maximumResults)
}
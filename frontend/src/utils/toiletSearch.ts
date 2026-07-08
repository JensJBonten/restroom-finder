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

/**
 * Finds the toilets closest to the supplied user position.
 *
 * The current distance is straight-line distance, not real walking
 * distance. It is used as a simple nearby filter until the backend
 * supports routing-based walking distance.
 *
 * @param toilets toilets returned by the backend
 * @param userLocation current user coordinates
 * @param options optional radius and result-count overrides
 * @returns nearby toilets sorted by straight-line distance
 */
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
        distanceMeters: calculateDistanceInMeters(
          userLocation,
          toiletLocation,
        ),
      }
    })
    .filter(
      (toilet) =>
        toilet.distanceMeters !== undefined &&
        toilet.distanceMeters <= searchRadiusMeters,
    )
    .sort(
      (firstToilet, secondToilet) =>
        (firstToilet.distanceMeters ?? 0) -
        (secondToilet.distanceMeters ?? 0),
    )
    .slice(0, maximumResults)
}
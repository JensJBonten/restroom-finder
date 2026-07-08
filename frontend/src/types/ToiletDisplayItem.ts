import type { Toilet } from './Toilet'

/**
 * Extends a backend toilet with an optional straight-line distance
 * from the user.
 *
 * The distance is unavailable when the browser cannot provide the
 * user's position.
 */
export type ToiletDisplayItem = Toilet & {
  distanceMeters?: number
}

import type { Toilet } from './Toilet'

// Distance is measured from the active search centre: the user’s position or Oslo.
export type ToiletDisplayItem = Toilet & {
  distanceMeters?: number
}

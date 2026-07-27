/**
 * Represents the filters selected by the user.
 *
 * A false boolean means that the corresponding restriction is not
 * active. A minimum cleanliness rating of zero accepts every rating.
 */
export type ToiletFilters = Readonly<{
  freeOnly: boolean
  publicOnly: boolean
  noEntryRequiredOnly: boolean
  minimumCleanlinessRating: number
}>

/**
 * Filter state used when the application starts or the user resets
 * every filter.
 */
export const DEFAULT_TOILET_FILTERS: ToiletFilters = {
  freeOnly: false,
  publicOnly: false,
  noEntryRequiredOnly: false,
  minimumCleanlinessRating: 0,
}
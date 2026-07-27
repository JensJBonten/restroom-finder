import type { ToiletDisplayItem } from "../types/ToiletDisplayItem";
import type { ToiletFilters } from "../types/ToiletFilters";

/**
 * Applies every active user filter to the supplied toilets.
 *
 * A toilet must match all active filters to remain in the returned
 * result. Array.filter creates a new array and does not mutate the
 * original input.
 *
 * @param toilets nearby or fallback toilets available to the user
 * @param filters current user-controlled filter settings
 * @returns a new array containing matching toilets
 */

export function filterToilets(
  toilets: readonly ToiletDisplayItem[],
  filters: ToiletFilters,
): ToiletDisplayItem[] {
  return toilets.filter((toilet) => {
    if (filters.freeOnly && !toilet.free) {
      return false
    }

    if (
      filters.publicOnly &&
      !toilet.publicToilet
    ) {
      return false
    }

    if (
      filters.noEntryRequiredOnly &&
      toilet.requiresEntry
    ) {
      return false
    }

    return (
      toilet.cleanlinessRating >=
      filters.minimumCleanlinessRating
    )
  })
}

/**
 * Counts the number of active filter restrictions.
 *
 * The minimum cleanliness value counts as one active filter,
 * regardless of whether the selected value is 1, 3 or 5.
 *
 * @param filters current filter settings
 * @returns number of active restrictions
 */
export function countActiveToiletFilters(
  filters: ToiletFilters,
): number {
  return (
    Number(filters.freeOnly) +
    Number(filters.publicOnly) +
    Number(filters.noEntryRequiredOnly) +
    Number(
      filters.minimumCleanlinessRating > 0,
    )
  )
}

/**
 * Determines whether at least one filter differs from the default.
 *
 * @param filters current filter settings
 * @returns true when the user has activated a restriction
 */
export function hasActiveToiletFilters(
  filters: ToiletFilters,
): boolean {
  return countActiveToiletFilters(filters) > 0
}
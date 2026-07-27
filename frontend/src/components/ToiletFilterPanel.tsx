import type { ToiletFilters } from '../types/ToiletFilters'
import { hasActiveToiletFilters } from '../utils/toiletFilters'

type ToiletFilterPanelProps = {
  /** Current filter settings controlled by App. */
  filters: ToiletFilters

  /** Called with the complete next filter state. */
  onFiltersChange: (
    filters: ToiletFilters,
  ) => void

  /** Restores every filter to its default value. */
  onResetFilters: () => void

  /** Closes the filter panel without changing the filters. */
  onClose: () => void
}

/**
 * Presents the controls used to filter nearby toilets.
 *
 * The component creates updated filter objects, but App remains the
 * owner of the actual filter state.
 */
export function ToiletFilterPanel({
  filters,
  onFiltersChange,
  onResetFilters,
  onClose,
}: ToiletFilterPanelProps) {
  /**
   * Updates one property while preserving all remaining filters.
   */
  function updateFilter<
    FilterKey extends keyof ToiletFilters,
  >(
    key: FilterKey,
    value: ToiletFilters[FilterKey],
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const filtersAreActive =
    hasActiveToiletFilters(filters)

  return (
    <section
      className="toilet-filter-panel"
      aria-labelledby="toilet-filter-heading"
    >
      <header className="toilet-filter-panel__header">
        <div>
          <p className="toilet-filter-panel__eyebrow">
            Refine results
          </p>

          <h2 id="toilet-filter-heading">
            Toilet filters
          </h2>
        </div>

        <button
          className="toilet-filter-panel__close-button"
          type="button"
          onClick={onClose}
        >
          Close filters
        </button>
      </header>

      <fieldset className="toilet-filter-panel__group">
        <legend>Availability</legend>

        <label className="toilet-filter-option">
          <input
            type="checkbox"
            checked={filters.freeOnly}
            onChange={(event) =>
              updateFilter(
                'freeOnly',
                event.currentTarget.checked,
              )
            }
          />

          <span>
            <strong>Free only</strong>

            <small>
              Hide toilets that require payment.
            </small>
          </span>
        </label>

        <label className="toilet-filter-option">
          <input
            type="checkbox"
            checked={filters.publicOnly}
            onChange={(event) =>
              updateFilter(
                'publicOnly',
                event.currentTarget.checked,
              )
            }
          />

          <span>
            <strong>
              Public toilets only
            </strong>

            <small>
              Hide toilets located inside other
              documented venues.
            </small>
          </span>
        </label>

        <label className="toilet-filter-option">
          <input
            type="checkbox"
            checked={
              filters.noEntryRequiredOnly
            }
            onChange={(event) =>
              updateFilter(
                'noEntryRequiredOnly',
                event.currentTarget.checked,
              )
            }
          />

          <span>
            <strong>
              No entry required
            </strong>

            <small>
              Hide toilets that require access
              to a venue.
            </small>
          </span>
        </label>
      </fieldset>

      <div className="toilet-filter-panel__rating">
        <label htmlFor="minimum-cleanliness-rating">
          Minimum cleanliness
        </label>

        <select
          id="minimum-cleanliness-rating"
          value={
            filters.minimumCleanlinessRating
          }
          onChange={(event) =>
            updateFilter(
              'minimumCleanlinessRating',
              Number(
                event.currentTarget.value,
              ),
            )
          }
        >
          <option value={0}>
            Any rating
          </option>

          <option value={1}>
            1 or higher
          </option>

          <option value={2}>
            2 or higher
          </option>

          <option value={3}>
            3 or higher
          </option>

          <option value={4}>
            4 or higher
          </option>

          <option value={5}>
            5 only
          </option>
        </select>
      </div>

      <button
        className="toilet-filter-panel__reset-button"
        type="button"
        disabled={!filtersAreActive}
        onClick={onResetFilters}
      >
        Reset filters
      </button>
    </section>
  )
}
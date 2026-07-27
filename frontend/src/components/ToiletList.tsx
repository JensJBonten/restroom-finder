import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import { formatDistance } from '../utils/distance'

type ToiletListProps = {
  /** Toilets to present when the map is not convenient to use. */
  toilets: ToiletDisplayItem[]

  /** Called when the user selects one toilet from the list. */
  onSelectToilet: (
    toilet: ToiletDisplayItem,
  ) => void

  /** Currently selected toilet used for visual and accessible state. */
  selectedToiletId?: number | null

  /** Message shown when the list has no toilets to display. */
  emptyMessage?: string
}

/**
 * Displays selectable toilets as a compact alternative to the map.
 *
 * The component receives already-filtered toilets. It presents the
 * available choices and reports user selection, but does not own
 * nearby-search or selection state.
 */
export function ToiletList({
  toilets,
  onSelectToilet,
  selectedToiletId = null,
  emptyMessage = 'No toilets found.',
}: ToiletListProps) {
  if (toilets.length === 0) {
    return (
      <p className="empty-message">
        {emptyMessage}
      </p>
    )
  }

  return (
    <section
      className="toilet-list"
      aria-labelledby="available-toilets-heading"
    >
      <h2 id="available-toilets-heading">
        Available toilets
      </h2>

      <ul className="toilet-list__items">
        {toilets.map((toilet) => {
          const isSelected =
            selectedToiletId === toilet.id

          return (
            <li key={toilet.id}>
              <button
                className={
                  isSelected
                    ? 'toilet-list-item toilet-list-item--selected'
                    : 'toilet-list-item'
                }
                type="button"
                aria-label={`View details for ${toilet.name}`}
                aria-pressed={isSelected}
                onClick={() =>
                  onSelectToilet(toilet)
                }
              >
                <span className="toilet-list-item__name">
                  {toilet.name}
                </span>

                {toilet.distanceMeters !== undefined && (
                  <span className="toilet-list-item__distance">
                    {formatDistance(
                      toilet.distanceMeters,
                    )}{' '}
                    away
                  </span>
                )}

                <span className="toilet-list-item__address">
                  {toilet.address}
                </span>

                <span className="toilet-list-item__details">
                  <span>
                    {toilet.free ? 'Free' : 'Paid'}
                  </span>

                  <span>
                    {toilet.publicToilet
                      ? 'Public toilet'
                      : 'Other documented toilet'}
                  </span>

                  <span>
                    {toilet.requiresEntry
                      ? 'Requires entry'
                      : 'No entry required'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
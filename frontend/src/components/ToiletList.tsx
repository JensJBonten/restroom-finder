import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import { formatDistance } from '../utils/distance'

type ToiletListProps = {
  /** Toilets to present when the map is not convenient to use. */
  toilets: ToiletDisplayItem[]

  /** Message shown when the list has no toilets to display. */
  emptyMessage?: string
}

/**
 * Displays toilets as a compact alternative to the map view.
 *
 * The list receives already-filtered data. It should only present the
 * toilets; it should not decide which toilets are nearby.
 */
export function ToiletList({
  toilets,
  emptyMessage = 'No toilets found.',
}: ToiletListProps) {
  if (toilets.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>
  }

  return (
    <section
      className="toilet-list"
      aria-labelledby="available-toilets-heading"
    >
      <h2 id="available-toilets-heading">Available toilets</h2>

      <div className="toilet-list__items">
        {toilets.map((toilet) => (
          <article className="toilet-list-item" key={toilet.id}>
            <h3>{toilet.name}</h3>

            {toilet.distanceMeters !== undefined && (
              <p className="toilet-list-item__distance">
                {formatDistance(toilet.distanceMeters)} away
              </p>
            )}

            <p>{toilet.address}</p>

            <div className="toilet-list-item__details">
              <span>{toilet.free ? 'Free' : 'Paid'}</span>

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
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
import type { Toilet } from '../types/Toilet'

type ToiletListProps = {
  toilets: Toilet[]
}

/**
 * Displays the toilets as a compact alternative to the map view.
 */

export function ToiletList({ toilets }: ToiletListProps) {
  if (toilets.length === 0) {
    return <p className="empty-message">No toilets found.</p>
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
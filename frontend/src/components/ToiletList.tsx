import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import { formatDistance } from '../utils/distance'
import { formatAccessibility, formatToiletName } from '../utils/toiletDisplay'

type ToiletListProps = {
  toilets: ToiletDisplayItem[]
  onSelectToilet: (toilet: ToiletDisplayItem) => void
  selectedToiletId?: number | null
  emptyMessage?: string
}

/**
 * Presents nearby toilets and delegates selection back to App.
 */
export function ToiletList({
  toilets,
  onSelectToilet,
  selectedToiletId = null,
  emptyMessage = 'Ingen toaletter funnet.',
}: ToiletListProps) {
  if (toilets.length === 0) {
    return <p className="empty-message">{emptyMessage}</p>
  }

  return (
    <section className="toilet-list" aria-labelledby="available-toilets-heading">
      <h2 id="available-toilets-heading">Toaletter i nærheten</h2>

      <ul className="toilet-list__items">
        {toilets.map((toilet) => {
          const isSelected = selectedToiletId === toilet.id

          return (
            <li key={toilet.id}>
              <button
                className={
                  isSelected
                    ? 'toilet-list-item toilet-list-item--selected'
                    : 'toilet-list-item'
                }
                type="button"
                aria-label={`Vis detaljer for ${formatToiletName(toilet.name)}`}
                aria-pressed={isSelected}
                onClick={() => onSelectToilet(toilet)}
              >
                <span className="toilet-list-item__name">
                  {formatToiletName(toilet.name)}
                </span>

                {toilet.distanceMeters !== undefined && (
                  <span className="toilet-list-item__distance">
                    {formatDistance(toilet.distanceMeters)} unna
                  </span>
                )}

                <span className="toilet-list-item__details">
                  {formatAccessibility(toilet.accessibilityStatus)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
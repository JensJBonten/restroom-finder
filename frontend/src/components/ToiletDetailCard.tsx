import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import { formatDistance } from '../utils/distance'
import { buildGoogleMapsWalkingUrl } from '../utils/googleMaps'

type ToiletDetailCardProps = {
  /** Toilet selected from the map or list. */
  toilet: ToiletDisplayItem

  /** Called when the user closes the detail card. */
  onClose: () => void
}

/**
 * Displays detailed information and navigation for one toilet.
 *
 * Selection state is owned by App so both the list and map can open
 * the same detail component.
 */
export function ToiletDetailCard({
  toilet,
  onClose,
}: ToiletDetailCardProps) {
  const headingId = `toilet-detail-heading-${toilet.id}`

  const navigationUrl =
    buildGoogleMapsWalkingUrl({
      latitude: toilet.latitude,
      longitude: toilet.longitude,
    })

  const toiletType = toilet.publicToilet
    ? 'Public toilet'
    : 'Other documented toilet'

  const entryRequirement = toilet.requiresEntry
    ? 'Requires entry'
    : 'No entry required'

  return (
    <aside
      className="toilet-detail-card"
      aria-labelledby={headingId}
    >
      <header className="toilet-detail-card__header">
        <div>
          <p className="toilet-detail-card__eyebrow">
            Selected toilet
          </p>

          <h2 id={headingId}>{toilet.name}</h2>
        </div>

        <button
          className="toilet-detail-card__close-button"
          type="button"
          aria-label={`Close details for ${toilet.name}`}
          onClick={onClose}
        >
          Close
        </button>
      </header>

      {toilet.distanceMeters !== undefined && (
        <p className="toilet-detail-card__distance">
          {formatDistance(toilet.distanceMeters)} away
        </p>
      )}

      <p className="toilet-detail-card__address">
        {toilet.address}
      </p>

      <dl className="toilet-detail-card__details">
        <div>
          <dt>Cost</dt>
          <dd>{toilet.free ? 'Free' : 'Paid'}</dd>
        </div>

        <div>
          <dt>Type</dt>
          <dd>{toiletType}</dd>
        </div>

        <div>
          <dt>Entry</dt>
          <dd>{entryRequirement}</dd>
        </div>

        <div>
          <dt>Cleanliness</dt>
          <dd>{toilet.cleanlinessRating}/5</dd>
        </div>
      </dl>

      <a
        className="toilet-detail-card__navigation-link"
        href={navigationUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Navigate with Google Maps
      </a>
    </aside>
  )
}
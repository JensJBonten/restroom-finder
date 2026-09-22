import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import { formatDistance } from '../utils/distance'
import { formatAccessibility, formatToiletName } from '../utils/toiletDisplay'
import { buildGoogleMapsWalkingUrl } from '../utils/googleMaps'

type ToiletDetailCardProps = {
  toilet: ToiletDisplayItem
  onClose: () => void
}

/**
 * Displays the shared selection from the map or list.
 */
export function ToiletDetailCard({ toilet, onClose }: ToiletDetailCardProps) {
  const headingId = `toilet-detail-heading-${toilet.id}`
  const navigationUrl = buildGoogleMapsWalkingUrl({
    latitude: toilet.latitude,
    longitude: toilet.longitude,
  })

  return (
    <aside className="toilet-detail-card" aria-labelledby={headingId}>
      <header className="toilet-detail-card__header">
        <div>
          <p className="toilet-detail-card__eyebrow">Valgt toalett</p>
          <h2 id={headingId}>{formatToiletName(toilet.name)}</h2>
        </div>

        <button
          className="toilet-detail-card__close-button"
          type="button"
          aria-label={`Lukk detaljer for ${formatToiletName(toilet.name)}`}
          onClick={onClose}
        >
          Lukk
        </button>
      </header>

      {toilet.distanceMeters !== undefined && (
        <p className="toilet-detail-card__distance">
          {formatDistance(toilet.distanceMeters)} unna
        </p>
      )}

      <dl className="toilet-detail-card__details">
        <div>
          <dt>Tilgjengelighet</dt>
          <dd>{formatAccessibility(toilet.accessibilityStatus)}</dd>
        </div>
      </dl>

      {toilet.comments && (
        <p className="toilet-detail-card__comments">{toilet.comments}</p>
      )}

      <a
        className="toilet-detail-card__navigation-link"
        href={navigationUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Åpne gangrute i Google Maps
      </a>
    </aside>
  )
}
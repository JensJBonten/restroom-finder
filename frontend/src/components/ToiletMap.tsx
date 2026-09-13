import { useEffect } from 'react'
import { divIcon, type LatLngTuple } from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import type { Coordinates } from '../types/Coordinates'
import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import { formatDistance } from '../utils/distance'
import { formatAccessibility, formatToiletName } from '../utils/toiletDisplay'

type ToiletMapProps = {
  toilets: ToiletDisplayItem[]
  userLocation: Coordinates | null
  onSelectToilet: (toilet: ToiletDisplayItem) => void
}

type MapCenterControllerProps = {
  userLocation: Coordinates | null
}

const OSLO_CENTER: LatLngTuple = [59.9139, 10.7522]
const DEFAULT_MAP_ZOOM = 13

// Reuse DivIcons across renders and avoid Leaflet's default image-path setup.
const toiletIcon = divIcon({
  className: 'toilet-marker',
  html: `
    <span class="toilet-marker__symbol" aria-hidden="true">
      WC
    </span>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
})

const userLocationIcon = divIcon({
  className: 'user-location-marker',
  html: `
    <span class="user-location-marker__symbol" aria-hidden="true">
      &#9679;
    </span>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
})

function toLatLngTuple(coordinates: Coordinates): LatLngTuple {
  return [coordinates.latitude, coordinates.longitude]
}

/**
 * Recenters the existing Leaflet map when the browser provides a location.
 */
function MapCenterController({ userLocation }: MapCenterControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      map.setView(toLatLngTuple(userLocation), DEFAULT_MAP_ZOOM)
    }
  }, [map, userLocation])

  return null
}

/**
 * Displays toilet markers and delegates marker selection to App.
 */
export function ToiletMap({
  toilets,
  userLocation,
  onSelectToilet,
}: ToiletMapProps) {
  const initialCenter = userLocation
    ? toLatLngTuple(userLocation)
    : OSLO_CENTER

  return (
    <MapContainer
      center={initialCenter}
      zoom={DEFAULT_MAP_ZOOM}
      scrollWheelZoom
      className="toilet-map"
    >
      <MapCenterController userLocation={userLocation} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker
          position={toLatLngTuple(userLocation)}
          icon={userLocationIcon}
          title="Din posisjon"
        >
          <Popup>
            <p>Du er her</p>
          </Popup>
        </Marker>
      )}

      {toilets.map((toilet) => (
        <Marker
          key={toilet.id}
          position={[toilet.latitude, toilet.longitude]}
          icon={toiletIcon}
          title={formatToiletName(toilet.name)}
          eventHandlers={{ click: () => onSelectToilet(toilet) }}
        >
          <Popup>
            <article className="toilet-popup">
              <h2>{formatToiletName(toilet.name)}</h2>

              {toilet.distanceMeters !== undefined && (
                <p className="toilet-popup__distance">
                  {formatDistance(toilet.distanceMeters)} unna
                </p>
              )}

              <p className="toilet-popup__status">
                {formatAccessibility(toilet.accessibilityStatus)}
              </p>
            </article>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
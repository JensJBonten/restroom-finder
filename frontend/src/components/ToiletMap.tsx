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

type ToiletMapProps = {
  /** Toilets whose coordinates determine the marker positions. */
  toilets: ToiletDisplayItem[]

  /** User position when the browser has provided it. */
  userLocation: Coordinates | null
}

type MapCenterControllerProps = {
  userLocation: Coordinates | null
}

const OSLO_CENTER: LatLngTuple = [59.9139, 10.7522]
const DEFAULT_MAP_ZOOM = 13

/*
 * This icon lives outside the component so Leaflet does not receive a new
 * icon object every time React renders the map. A DivIcon also avoids the
 * extra image-path configuration required by Leaflet's default marker.
 */
const toiletIcon = divIcon({
  className: 'toilet-marker',
  html: `
    <span class="toilet-marker__symbol" aria-hidden="true">
      🚽
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
      ●
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
 * Moves the already-created Leaflet map when the user's location arrives.
 *
 * The map uses a slightly zoomed-out view so mobile users can see more
 * of the surrounding city instead of only the closest streets.
 */
function MapCenterController({
  userLocation,
}: MapCenterControllerProps) {
  const map = useMap()

  useEffect(() => {
    if (!userLocation) {
      return
    }

    map.setView(toLatLngTuple(userLocation), DEFAULT_MAP_ZOOM)
  }, [map, userLocation])

  return null
}

/**
 * Displays nearby toilets and, when available, the user's position.
 *
 * @param toilets already-filtered toilets to show as markers
 * @param userLocation current user coordinates or null fallback
 */
export function ToiletMap({
  toilets,
  userLocation,
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
          title="Your location"
        >
          <Popup>
            <p>You are here</p>
          </Popup>
        </Marker>
      )}

      {toilets.map((toilet) => (
        <Marker
          key={toilet.id}
          position={[toilet.latitude, toilet.longitude]}
          icon={toiletIcon}
          title={toilet.name}
        >
          <Popup>
            <article className="toilet-popup">
              <h2>{toilet.name}</h2>

              {toilet.distanceMeters !== undefined && (
                <p className="toilet-popup__distance">
                  {formatDistance(toilet.distanceMeters)} away
                </p>
              )}

              <p>{toilet.address}</p>

              <p className="toilet-popup__status">
                {toilet.free ? 'Free' : 'Paid'}
              </p>
            </article>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
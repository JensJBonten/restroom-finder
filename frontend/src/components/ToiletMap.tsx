import { divIcon, type LatLngTuple } from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from 'react-leaflet'
import type { Toilet } from '../types/Toilet'

type ToiletMapProps = {
  toilets: Toilet[]
}


const OSLO_CENTER: LatLngTuple = [59.9139, 10.7522]

/**
 * DivIcon ises a simple WC symbol without depending on Leaflet's defualt marker image files. 
 * A custom SVG can replace this later. 
 */

const toiletIcon = divIcon({
    className: 'toilet-marker',
    html: 
    `
    <span class="toilet-marker__symbol" aria-hidden="true">
      🚽
    </span>
  `, 
    iconSize: [42, 42],
    iconAnchor: [21, 21], 
    popupAnchor: [0, -21],
})

/**
 * Displays toilets received from the backend as interactive map markers.
 *
 * @param toilets toilets with latitude and longitude coordinates
 */

export function ToiletMap({ toilets }: ToiletMapProps) {
  return (
    <MapContainer
      center={OSLO_CENTER}
      zoom={14}
      scrollWheelZoom
      className="toilet-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

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
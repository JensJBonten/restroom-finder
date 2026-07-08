/**
 * Represents one geographic position using decimal coordinates.
 *
 * Latitude describes the north/south position. Longitude describes
 * the east/west position.
 */
export type Coordinates = Readonly<{
  latitude: number
  longitude: number
}>

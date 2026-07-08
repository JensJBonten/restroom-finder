import { describe, expect, it } from 'vitest'
import type { Coordinates } from '../types/Coordinates'
import {
  calculateDistanceInMeters,
  formatDistance,
} from './distance'

const YOUNGSTORGET: Coordinates = {
  latitude: 59.914,
  longitude: 10.7522,
}

const OSLO_CENTRAL_STATION: Coordinates = {
  latitude: 59.9111,
  longitude: 10.7503,
}

describe('calculateDistanceInMeters', () => {
  it('returns zero when both coordinates are identical', () => {
    const distanceMeters = calculateDistanceInMeters(
      YOUNGSTORGET,
      YOUNGSTORGET,
    )

    expect(distanceMeters).toBeCloseTo(0)
  })

  it('calculates a realistic distance between two Oslo locations', () => {
    const distanceMeters = calculateDistanceInMeters(
      YOUNGSTORGET,
      OSLO_CENTRAL_STATION,
    )

    /*
     * The exact value can vary slightly because of floating-point
     * calculations, so this test uses a realistic range.
     */
    expect(distanceMeters).toBeGreaterThan(300)
    expect(distanceMeters).toBeLessThan(400)
  })

  it('returns the same distance regardless of direction', () => {
    const distanceFromYoungstorget =
      calculateDistanceInMeters(
        YOUNGSTORGET,
        OSLO_CENTRAL_STATION,
      )

    const distanceFromOsloCentralStation =
      calculateDistanceInMeters(
        OSLO_CENTRAL_STATION,
        YOUNGSTORGET,
      )

    expect(distanceFromYoungstorget).toBeCloseTo(
      distanceFromOsloCentralStation,
    )
  })
})

describe('formatDistance', () => {
  it('formats short distances as rounded metres', () => {
    expect(formatDistance(349.6)).toBe('350 m')
  })

  it('formats longer distances as kilometres', () => {
    expect(formatDistance(1_350)).toBe('1.4 km')
  })
})
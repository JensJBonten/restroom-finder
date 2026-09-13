import { describe, expect, it } from 'vitest'
import type { Coordinates } from '../types/Coordinates'
import type { Toilet } from '../types/Toilet'
import { findNearbyToilets } from './toiletSearch'

const USER_LOCATION: Coordinates = {
  latitude: 59.9139,
  longitude: 10.7522,
}

/**
 * Creates compact test data while preserving the complete Toilet type.
 */

function createTestToilet(
  id: number,
  latitudeOffset: number,
): Toilet {
  return {
    id,
    source: 'OSLO',
    toiletType: null,
    accessibilityStatus: null,
    comments: null,
    sourceModifiedAt: null,
    name: `Test toilet ${id}`,
    latitude: USER_LOCATION.latitude + latitudeOffset,
    longitude: USER_LOCATION.longitude,
  }
}

describe('findNearbyToilets', () => {
  it('removes toilets outside the search radius', () => {
    const nearbyToilet = createTestToilet(1, 0.001)
    const distantToilet = createTestToilet(2, 0.02)

    const result = findNearbyToilets(
      [nearbyToilet, distantToilet],
      USER_LOCATION,
    )

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('sorts toilets from nearest to furthest', () => {
    const furthestToilet = createTestToilet(1, 0.006)
    const nearestToilet = createTestToilet(2, 0.001)
    const middleToilet = createTestToilet(3, 0.003)

    const result = findNearbyToilets(
      [furthestToilet, nearestToilet, middleToilet],
      USER_LOCATION,
    )

    expect(result.map((toilet) => toilet.id)).toEqual([
      2,
      3,
      1,
    ])
  })

  it('returns no more than the configured maximum', () => {
    const toilets = Array.from({ length: 8 }, (_, index) =>
      createTestToilet(index + 1, (index + 1) * 0.0005),
    )

    const result = findNearbyToilets(
      toilets,
      USER_LOCATION,
      {
        searchRadiusMeters: 2_000,
        maximumResults: 6,
      },
    )

    expect(result).toHaveLength(6)
  })

  it('returns no more than six toilets by default', () => {
    const toilets = Array.from({ length: 8 }, (_, index) =>
      createTestToilet(index + 1, (index + 1) * 0.0005),
    )

    const result = findNearbyToilets(toilets, USER_LOCATION)

    expect(result).toHaveLength(6)
  })

  it('returns an empty array when no toilets are supplied', () => {
    const result = findNearbyToilets([], USER_LOCATION)

    expect(result).toEqual([])
  })

  it('adds a calculated distance to each result', () => {
    const toilet = createTestToilet(1, 0.001)

    const result = findNearbyToilets([toilet], USER_LOCATION)

    expect(result[0].distanceMeters).toBeGreaterThan(0)
  })

  it('does not mutate the original toilet array or toilet objects', () => {
    const furthestToilet = createTestToilet(1, 0.006)
    const nearestToilet = createTestToilet(2, 0.001)
    const originalToilets = [furthestToilet, nearestToilet]

    findNearbyToilets(originalToilets, USER_LOCATION)

    expect(originalToilets).toEqual([furthestToilet, nearestToilet])
    expect(originalToilets[0]).not.toHaveProperty('distanceMeters')
    expect(originalToilets[1]).not.toHaveProperty('distanceMeters')
  })
})

import { describe, expect, it } from 'vitest'
import type { ToiletDisplayItem } from '../types/ToiletDisplayItem'
import {
  DEFAULT_TOILET_FILTERS,
  type ToiletFilters,
} from '../types/ToiletFilters'
import {
  countActiveToiletFilters,
  filterToilets,
  hasActiveToiletFilters,
} from './toiletFilters'

const filterTestToilets: ToiletDisplayItem[] = [
  {
    id: 1,
    name: 'Free public toilet',
    address: 'Public Square 1',
    latitude: 59.91,
    longitude: 10.75,
    free: true,
    publicToilet: true,
    requiresEntry: false,
    cleanlinessRating: 4.5,
    distanceMeters: 100,
  },
  {
    id: 2,
    name: 'Paid documented toilet',
    address: 'Shopping Centre 1',
    latitude: 59.92,
    longitude: 10.76,
    free: false,
    publicToilet: false,
    requiresEntry: true,
    cleanlinessRating: 5,
    distanceMeters: 200,
  },
  {
    id: 3,
    name: 'Paid public toilet',
    address: 'Public Square 2',
    latitude: 59.93,
    longitude: 10.77,
    free: false,
    publicToilet: true,
    requiresEntry: false,
    cleanlinessRating: 3.2,
    distanceMeters: 300,
  },
  {
    id: 4,
    name: 'Free documented toilet',
    address: 'Library 1',
    latitude: 59.94,
    longitude: 10.78,
    free: true,
    publicToilet: false,
    requiresEntry: false,
    cleanlinessRating: 2.8,
    distanceMeters: 400,
  },
]

describe('filterToilets', () => {
  it('returns every toilet when no filters are active', () => {
    const result = filterToilets(
      filterTestToilets,
      DEFAULT_TOILET_FILTERS,
    )

    expect(result).toEqual(filterTestToilets)

    /*
     * The values are equal, but filter() must still have returned
     * a new array.
     */
    expect(result).not.toBe(filterTestToilets)
  })

  it('keeps only free toilets', () => {
    const filters: ToiletFilters = {
      ...DEFAULT_TOILET_FILTERS,
      freeOnly: true,
    }

    const result = filterToilets(
      filterTestToilets,
      filters,
    )

    expect(
      result.map((toilet) => toilet.id),
    ).toEqual([1, 4])
  })

  it('keeps only public toilets', () => {
    const filters: ToiletFilters = {
      ...DEFAULT_TOILET_FILTERS,
      publicOnly: true,
    }

    const result = filterToilets(
      filterTestToilets,
      filters,
    )

    expect(
      result.map((toilet) => toilet.id),
    ).toEqual([1, 3])
  })

  it('removes toilets that require entry', () => {
    const filters: ToiletFilters = {
      ...DEFAULT_TOILET_FILTERS,
      noEntryRequiredOnly: true,
    }

    const result = filterToilets(
      filterTestToilets,
      filters,
    )

    expect(
      result.map((toilet) => toilet.id),
    ).toEqual([1, 3, 4])
  })

  it('applies the minimum cleanliness rating', () => {
    const filters: ToiletFilters = {
      ...DEFAULT_TOILET_FILTERS,
      minimumCleanlinessRating: 4,
    }

    const result = filterToilets(
      filterTestToilets,
      filters,
    )

    expect(
      result.map((toilet) => toilet.id),
    ).toEqual([1, 2])
  })

  it('requires every active filter to match', () => {
    const filters: ToiletFilters = {
      freeOnly: true,
      publicOnly: true,
      noEntryRequiredOnly: true,
      minimumCleanlinessRating: 4,
    }

    const result = filterToilets(
      filterTestToilets,
      filters,
    )

    expect(
      result.map((toilet) => toilet.id),
    ).toEqual([1])
  })

  it('does not mutate the original array', () => {
    const originalIds = filterTestToilets.map(
      (toilet) => toilet.id,
    )

    filterToilets(filterTestToilets, {
      ...DEFAULT_TOILET_FILTERS,
      freeOnly: true,
    })

    expect(
      filterTestToilets.map(
        (toilet) => toilet.id,
      ),
    ).toEqual(originalIds)
  })
})

describe('active toilet filters', () => {
  it('reports no active filters for the default state', () => {
    expect(
      hasActiveToiletFilters(
        DEFAULT_TOILET_FILTERS,
      ),
    ).toBe(false)

    expect(
      countActiveToiletFilters(
        DEFAULT_TOILET_FILTERS,
      ),
    ).toBe(0)
  })

  it('counts each active restriction', () => {
    const filters: ToiletFilters = {
      freeOnly: true,
      publicOnly: true,
      noEntryRequiredOnly: false,
      minimumCleanlinessRating: 4,
    }

    expect(
      hasActiveToiletFilters(filters),
    ).toBe(true)

    expect(
      countActiveToiletFilters(filters),
    ).toBe(3)
  })
})
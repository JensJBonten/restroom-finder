import type { Toilet } from '../types/Toilet'

export const toilets: Toilet[] = [
  {
    id: 1,
    source: 'OSLO',
    toiletType: null,
    accessibilityStatus: 'ACCESSIBLE',
    comments: 'Inngang ved hovedinngangen.',
    sourceModifiedAt: '2026-09-01T12:00:00Z',
    name: 'Oslo Central Station',
    latitude: 59.9109,
    longitude: 10.7523,
  },
  {
    id: 2,
    source: 'OSLO',
    toiletType: null,
    accessibilityStatus: null,
    comments: null,
    sourceModifiedAt: null,
    name: 'Deichman Bjørvika',
    latitude: 59.9077,
    longitude: 10.7532,
  },
]

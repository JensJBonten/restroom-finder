import type { Toilet } from '../types/Toilet'

export const toilets: Toilet[] = [
  {
    id: 1,
    name: 'Oslo Central Station',
    address: 'Jernbanetorget 1',
    latitude: 59.9109,
    longitude: 10.7523,
    free: false,
    publicToilet: true,
    requiresEntry: false,
    cleanlinessRating: 4,
  },
  {
    id: 2,
    name: 'Deichman Bjørvika',
    address: 'Anne-Cath. Vestlys plass 1',
    latitude: 59.9077,
    longitude: 10.7532,
    free: true,
    publicToilet: false,
    requiresEntry: true,
    cleanlinessRating: 5,
  },
]

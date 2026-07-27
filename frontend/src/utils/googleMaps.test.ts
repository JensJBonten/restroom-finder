import { describe, expect, it } from 'vitest'
import { buildGoogleMapsWalkingUrl } from './googleMaps'

describe('buildGoogleMapsWalkingUrl', () => {
  it('builds a Google Maps walking directions URL', () => {
    const result = buildGoogleMapsWalkingUrl({
      latitude: 59.9109,
      longitude: 10.7523,
    })

    const googleMapsUrl = new URL(result)

    expect(googleMapsUrl.origin).toBe(
      'https://www.google.com',
    )
    expect(googleMapsUrl.pathname).toBe('/maps/dir/')
    expect(
      googleMapsUrl.searchParams.get('api'),
    ).toBe('1')
    expect(
      googleMapsUrl.searchParams.get('destination'),
    ).toBe('59.9109,10.7523')
    expect(
      googleMapsUrl.searchParams.get('travelmode'),
    ).toBe('walking')
  })

  it('preserves negative destination coordinates', () => {
    const result = buildGoogleMapsWalkingUrl({
      latitude: -33.8688,
      longitude: 151.2093,
    })

    const googleMapsUrl = new URL(result)

    expect(
      googleMapsUrl.searchParams.get('destination'),
    ).toBe('-33.8688,151.2093')
  })
})
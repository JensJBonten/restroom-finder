import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchToilets } from './api/toiletsApi'
import App from './App'
import { useUserLocation } from './hooks/useUserLocation'
import { toilets } from './test/fixtures'
import type { Coordinates } from './types/Coordinates'
import type { ToiletDisplayItem } from './types/ToiletDisplayItem'

vi.mock('./api/toiletsApi', () => ({
  fetchToilets: vi.fn(),
}))

vi.mock('./hooks/useUserLocation', () => ({
  useUserLocation: vi.fn(),
}))

type ToiletMapMockProps = {
  toilets: ToiletDisplayItem[]
  mapCenter: Coordinates
  userLocation: Coordinates | null
  onSelectToilet: (toilet: ToiletDisplayItem) => void
}

vi.mock('./components/ToiletMap', () => ({
  ToiletMap: ({
    toilets: mapToilets,
    mapCenter,
    userLocation,
    onSelectToilet,
  }: ToiletMapMockProps) => (
    <div
      data-testid="toilet-map"
      data-map-center={JSON.stringify(mapCenter)}
      data-user-location={JSON.stringify(userLocation)}
    >
      <p>
        {mapToilets.length} map markers
        {userLocation
          ? ' with user location'
          : ' without user location'}
      </p>

      {mapToilets.map((toilet) => (
        <button
          key={toilet.id}
          type="button"
          onClick={() => onSelectToilet(toilet)}
        >
          Select {toilet.name ?? 'Offentlig toalett'} marker
        </button>
      ))}
    </div>
  ),
}))

const fetchToiletsMock = vi.mocked(fetchToilets)
const useUserLocationMock = vi.mocked(useUserLocation)

describe('App', () => {
  beforeEach(() => {
    fetchToiletsMock.mockReset()

    useUserLocationMock.mockReturnValue({
      coordinates: {
        latitude: 59.9139,
        longitude: 10.7522,
      },
      status: 'success',
      errorMessage: null,
    })
  })

  it('shows a loading state while the request is pending', () => {
    fetchToiletsMock.mockReturnValue(
      new Promise<never>(() => undefined),
    )

    render(<App />)

    expect(
      screen.getByText('Laster toaletter...'),
    ).toBeInTheDocument()
  })

  it('shows the map and nearby count after loading succeeds', async () => {
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    expect(
      await screen.findByTestId('toilet-map'),
    ).toHaveTextContent(
      '2 map markers with user location',
    )

    expect(
      screen.getByText(
        'Viser 2 av 2 toaletter i nærheten.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Vis liste (2)',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('button', {
        name: 'Filters',
      }),
    ).not.toBeInTheDocument()
  })

  it('shows an API error and hides the map', async () => {
    fetchToiletsMock.mockRejectedValue(
      new Error('Network unavailable'),
    )

    render(<App />)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'Kunne ikke laste toaletter: Network unavailable',
    )

    expect(
      screen.queryByTestId('toilet-map'),
    ).not.toBeInTheDocument()
  })

  it('shows the location fallback when permission is denied', async () => {
    useUserLocationMock.mockReturnValue({
      coordinates: null,
      status: 'denied',
      errorMessage:
        'Du har ikke gitt tilgang til posisjonen din. Viser toaletter i Oslo i stedet.',
    })

    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    expect(
      await screen.findByText(
        'Du har ikke gitt tilgang til posisjonen din. Viser toaletter i Oslo i stedet.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('toilet-map'),
    ).toHaveTextContent(
      '2 map markers without user location',
    )
  })

  it('shows Oslo results on request while preserving the real user location', async () => {
    const user = userEvent.setup()
    useUserLocationMock.mockReturnValue({
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
      status: 'success',
      errorMessage: null,
    })

    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    expect(
      await screen.findByText(
        'Ingen toaletter funnet i nærheten. Datakilden dekker foreløpig Oslo.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('toilet-map'),
    ).toHaveTextContent(
      '0 map markers with user location',
    )
    expect(screen.getByTestId('toilet-map')).toHaveAttribute(
      'data-map-center', JSON.stringify({ latitude: 0, longitude: 0 }),
    )

    await user.click(screen.getByRole('button', { name: 'Vis Oslo' }))

    expect(screen.getByTestId('toilet-map')).toHaveTextContent('2 map markers with user location')
    expect(screen.getByTestId('toilet-map')).toHaveAttribute(
      'data-map-center', JSON.stringify({ latitude: 59.9139, longitude: 10.7522 }),
    )
    expect(screen.getByTestId('toilet-map')).toHaveAttribute(
      'data-user-location', JSON.stringify({ latitude: 0, longitude: 0 }),
    )
    expect(screen.getByText('Viser 2 av 2 toaletter nær Oslo sentrum.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Vis Oslo' })).not.toBeInTheDocument()
    for (const toilet of toilets) {
      expect(screen.getByRole('button', { name: `Select ${toilet.name} marker` })).toBeInTheDocument()
    }

    await user.click(screen.getByRole('button', { name: 'Vis liste (2)' }))
    await user.click(screen.getByRole('button', { name: 'Vis detaljer for Oslo Central Station' }))
    expect(screen.getByRole('heading', { name: 'Oslo Central Station' })).toBeInTheDocument()
    const navigationUrl = new URL(
      screen.getByRole('link', { name: 'Åpne gangrute i Google Maps' }).getAttribute('href') ?? '',
    )
    expect(navigationUrl.searchParams.get('destination')).toBe('59.9109,10.7523')
    expect(navigationUrl.searchParams.get('travelmode')).toBe('walking')
  })

  it('limits Oslo results to the six closest toilets within 2 km', async () => {
    const user = userEvent.setup()
    useUserLocationMock.mockReturnValue({
      coordinates: { latitude: 0, longitude: 0 },
      status: 'success',
      errorMessage: null,
    })
    const osloToilets = Array.from({ length: 10 }, (_, index) => ({
      ...toilets[0],
      id: index + 10,
      name: `Oslo toilet ${index}`,
      latitude: 59.9139 + index * 0.001,
      longitude: 10.7522,
    }))
    fetchToiletsMock.mockResolvedValue([
      { ...toilets[0], id: 99, name: 'Outside radius', latitude: 60 },
      ...osloToilets.slice().reverse(),
    ])

    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Vis Oslo' }))

    expect(screen.getByText('Viser 6 av 10 toaletter nær Oslo sentrum.')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Select / }).map((button) => button.textContent))
      .toEqual(osloToilets.slice(0, 6).map((toilet) => `Select ${toilet.name} marker`))
  })

  it('clears selection when the search area changes', async () => {
    const user = userEvent.setup()
    fetchToiletsMock.mockResolvedValue(toilets)
    const { rerender } = render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Select Oslo Central Station marker' }))
    expect(screen.getByRole('heading', { name: 'Oslo Central Station' })).toBeInTheDocument()

    useUserLocationMock.mockReturnValue({
      coordinates: { latitude: 0, longitude: 0 },
      status: 'success',
      errorMessage: null,
    })
    rerender(<App />)
    expect(screen.queryByRole('heading', { name: 'Oslo Central Station' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Vis Oslo' }))
    expect(screen.queryByRole('heading', { name: 'Oslo Central Station' })).not.toBeInTheDocument()
  })

  it('opens and closes the toilet list', async () => {
    const user = userEvent.setup()
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Vis liste (2)',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Toaletter i nærheten',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Lukk liste',
      }),
    )

    expect(
      screen.queryByRole('heading', {
        name: 'Toaletter i nærheten',
      }),
    ).not.toBeInTheDocument()
  })

  it('selects a toilet from the list', async () => {
    const user = userEvent.setup()
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Vis liste (2)',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Vis detaljer for Oslo Central Station',
      }),
    )

    expect(
      screen.queryByRole('heading', {
        name: 'Toaletter i nærheten',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Oslo Central Station',
      }),
    ).toBeInTheDocument()

    const navigationLink = screen.getByRole('link', {
      name: 'Åpne gangrute i Google Maps',
    })

    const navigationUrl = new URL(
      navigationLink.getAttribute('href') ?? '',
    )

    expect(
      navigationUrl.searchParams.get('destination'),
    ).toBe('59.9109,10.7523')

    expect(
      navigationUrl.searchParams.get('travelmode'),
    ).toBe('walking')
  })

  it('selects a toilet from a map marker', async () => {
    const user = userEvent.setup()
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Select Deichman Bjørvika marker',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Deichman Bjørvika',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Ikke registrert'),
    ).toBeInTheDocument()
  })
})
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
  userLocation: Coordinates | null
  onSelectToilet: (toilet: ToiletDisplayItem) => void
}

vi.mock('./components/ToiletMap', () => ({
  ToiletMap: ({
    toilets: mapToilets,
    userLocation,
    onSelectToilet,
  }: ToiletMapMockProps) => (
    <div data-testid="toilet-map">
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
        'Location access was denied. Showing Oslo toilets instead.',
    })

    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    expect(
      await screen.findByText(
        'Location access was denied. Showing Oslo toilets instead.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('toilet-map'),
    ).toHaveTextContent(
      '2 map markers without user location',
    )
  })

  it('shows an empty nearby message when no toilets are within range', async () => {
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
        'Ingen toaletter funnet innenfor 2 km.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('toilet-map'),
    ).toHaveTextContent(
      '0 map markers with user location',
    )
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
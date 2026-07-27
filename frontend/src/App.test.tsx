import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
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
  onSelectToilet: (
    toilet: ToiletDisplayItem,
  ) => void
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
          onClick={() =>
            onSelectToilet(toilet)
          }
        >
          Select {toilet.name} marker
        </button>
      ))}
    </div>
  ),
}))

const fetchToiletsMock =
  vi.mocked(fetchToilets)

const useUserLocationMock =
  vi.mocked(useUserLocation)

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
      screen.getByText('Loading toilets...'),
    ).toBeInTheDocument()
  })

  it('shows the map and nearby toilet count after loading succeeds', async () => {
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    expect(
      await screen.findByTestId('toilet-map'),
    ).toHaveTextContent(
      '2 map markers with user location',
    )

    expect(
      screen.getByRole('button', {
        name: 'Show list (2)',
      }),
    ).toBeInTheDocument()
  })

  it('shows an API error and hides the map', async () => {
    fetchToiletsMock.mockRejectedValue(
      new Error('Network unavailable'),
    )

    render(<App />)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'Could not load toilets: Network unavailable',
    )

    expect(
      screen.queryByTestId('toilet-map'),
    ).not.toBeInTheDocument()
  })

  it('shows a location fallback message when location is denied', async () => {
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
        'No toilets found within 2 km.',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('toilet-map'),
    ).toHaveTextContent(
      '0 map markers with user location',
    )

    expect(
      screen.queryByText(
        'Showing toilets within 2 km of your location.',
      ),
    ).not.toBeInTheDocument()
  })

  it('opens and closes the toilet list', async () => {
    const user = userEvent.setup()

    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Show list (2)',
      }),
    )

    expect(
      screen.getByRole('heading', {
        name: 'Available toilets',
      }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Close list',
      }),
    )

    expect(
      screen.queryByRole('heading', {
        name: 'Available toilets',
      }),
    ).not.toBeInTheDocument()
  })

  it('selects a toilet from the list and closes its detail card', async () => {
    const user = userEvent.setup()

    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Show list (2)',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'View details for Oslo Central Station',
      }),
    )

    expect(
      screen.queryByRole('heading', {
        name: 'Available toilets',
      }),
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('heading', {
        name: 'Oslo Central Station',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Jernbanetorget 1'),
    ).toBeInTheDocument()

    const navigationLink =
      screen.getByRole('link', {
        name: 'Navigate with Google Maps',
      })

    const navigationUrl = new URL(
      navigationLink.getAttribute('href') ?? '',
    )

    expect(
      navigationUrl.searchParams.get(
        'destination',
      ),
    ).toBe('59.9109,10.7523')

    expect(
      navigationUrl.searchParams.get(
        'travelmode',
      ),
    ).toBe('walking')

    await user.click(
      screen.getByRole('button', {
        name: 'Close details for Oslo Central Station',
      }),
    )

    expect(
      screen.queryByRole('heading', {
        name: 'Oslo Central Station',
      }),
    ).not.toBeInTheDocument()
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
      screen.getByText(
        'Anne-Cath. Vestlys plass 1',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Free'),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Other documented toilet',
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Requires entry'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('5/5'),
    ).toBeInTheDocument()
  })
})
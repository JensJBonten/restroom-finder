import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchToilets } from './api/toiletsApi'
import App from './App'
import { useUserLocation } from './hooks/useUserLocation'
import { toilets } from './test/fixtures'

vi.mock('./api/toiletsApi', () => ({
  fetchToilets: vi.fn(),
}))

vi.mock('./hooks/useUserLocation', () => ({
  useUserLocation: vi.fn(),
}))

vi.mock('./components/ToiletMap', () => ({
  ToiletMap: ({
    toilets: mapToilets,
    userLocation,
  }: {
    toilets: unknown[]
    userLocation: unknown
  }) => (
    <div data-testid="toilet-map">
      {mapToilets.length} map markers
      {userLocation ? ' with user location' : ' without user location'}
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
    fetchToiletsMock.mockReturnValue(new Promise(() => {}))

    render(<App />)

    expect(screen.getByText('Loading toilets...')).toBeInTheDocument()
  })

  it('shows the map and nearby toilet count after loading succeeds', async () => {
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    expect(await screen.findByTestId('toilet-map')).toHaveTextContent(
      '2 map markers with user location',
    )
    expect(
      screen.getByRole('button', { name: 'Show list (2)' }),
    ).toBeInTheDocument()
  })

  it('shows an API error and hides the map', async () => {
    fetchToiletsMock.mockRejectedValue(new Error('Network unavailable'))

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load toilets: Network unavailable',
    )
    expect(screen.queryByTestId('toilet-map')).not.toBeInTheDocument()
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

    expect(screen.getByTestId('toilet-map')).toHaveTextContent(
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
      await screen.findByText('No toilets found within 2 km.'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('toilet-map')).toHaveTextContent(
      '0 map markers with user location',
    )
    expect(
      screen.queryByText('Showing toilets within 2 km of your location.'),
    ).not.toBeInTheDocument()
  })

  it('opens and closes the toilet list', async () => {
    const user = userEvent.setup()
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    await user.click(
      await screen.findByRole('button', { name: 'Show list (2)' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Available toilets' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close list' }))

    expect(
      screen.queryByRole('heading', { name: 'Available toilets' }),
    ).not.toBeInTheDocument()
  })
})

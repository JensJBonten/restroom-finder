import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchToilets } from './api/toiletsApi'
import App from './App'
import { toilets } from './test/fixtures'

vi.mock('./api/toiletsApi', () => ({
  fetchToilets: vi.fn(),
}))

vi.mock('./components/ToiletMap', () => ({
  ToiletMap: ({ toilets: mapToilets }: { toilets: unknown[] }) => (
    <div data-testid="toilet-map">
      {mapToilets.length} map markers
    </div>
  ),
}))

const fetchToiletsMock = vi.mocked(fetchToilets)

describe('App', () => {
  beforeEach(() => {
    fetchToiletsMock.mockReset()
  })

  it('shows a loading state while the request is pending', () => {
    fetchToiletsMock.mockReturnValue(new Promise(() => {}))

    render(<App />)

    expect(screen.getByText('Loading toilets...')).toBeInTheDocument()
  })

  it('shows the map and toilet count after loading succeeds', async () => {
    fetchToiletsMock.mockResolvedValue(toilets)

    render(<App />)

    expect(await screen.findByTestId('toilet-map')).toHaveTextContent(
      '2 map markers',
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

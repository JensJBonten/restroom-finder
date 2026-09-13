import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toilets } from '../test/fixtures'
import { ToiletMap } from './ToiletMap'

const map = vi.hoisted(() => ({ setView: vi.fn() }))
const osloCenter = { latitude: 59.9139, longitude: 10.7522 }

type MarkerProps = {
  children: ReactNode
  position: [number, number]
  title: string
  eventHandlers?: { click: () => void }
}

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Marker: ({ children, position, title, eventHandlers }: MarkerProps) => (
    <div title={title} data-position={JSON.stringify(position)} onClick={eventHandlers?.click}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  useMap: () => map,
}))

describe('ToiletMap', () => {
  beforeEach(() => {
    map.setView.mockClear()
  })

  it('recenters on mapCenter while preserving the real user marker', () => {
    const userLocation = { latitude: 60.39, longitude: 5.32 }
    const onSelectToilet = vi.fn()
    const { rerender } = render(
      <ToiletMap toilets={[]} mapCenter={userLocation} userLocation={userLocation} onSelectToilet={onSelectToilet} />,
    )
    expect(map.setView).toHaveBeenLastCalledWith([60.39, 5.32], 13)

    rerender(
      <ToiletMap toilets={toilets} mapCenter={osloCenter} userLocation={userLocation} onSelectToilet={onSelectToilet} />,
    )

    expect(map.setView).toHaveBeenLastCalledWith([59.9139, 10.7522], 13)
    expect(screen.getByTitle('Din posisjon')).toHaveAttribute('data-position', '[60.39,5.32]')
  })

  it('shows Oslo without a user marker when the user location is unavailable', () => {
    render(<ToiletMap toilets={[]} mapCenter={osloCenter} userLocation={null} onSelectToilet={vi.fn()} />)

    expect(map.setView).toHaveBeenCalledWith([59.9139, 10.7522], 13)
    expect(screen.queryByTitle('Din posisjon')).not.toBeInTheDocument()
  })

  it('shows an unnamed marker and its accessibility and reports selection', () => {
    const toilet = { ...toilets[0], name: null, accessibilityStatus: null }
    const onSelectToilet = vi.fn()
    render(<ToiletMap toilets={[toilet]} mapCenter={osloCenter} userLocation={null} onSelectToilet={onSelectToilet} />)

    fireEvent.click(screen.getByTitle('Offentlig toalett'))

    expect(onSelectToilet).toHaveBeenCalledWith(toilet)
    expect(screen.getByRole('heading', { name: 'Offentlig toalett' })).toBeInTheDocument()
    expect(screen.getByText('Ikke registrert')).toBeInTheDocument()
  })
})

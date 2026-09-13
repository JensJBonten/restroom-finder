import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { toilets } from '../test/fixtures'
import { ToiletMap } from './ToiletMap'

describe('ToiletMap', () => {
  it('shows an unnamed marker and its accessibility and reports selection', () => {
    const toilet = { ...toilets[0], name: null, accessibilityStatus: null }
    const onSelectToilet = vi.fn()
    render(<ToiletMap toilets={[toilet]} userLocation={null} onSelectToilet={onSelectToilet} />)

    fireEvent.click(screen.getByTitle('Offentlig toalett'))

    expect(onSelectToilet).toHaveBeenCalledWith(toilet)
    expect(screen.getByRole('heading', { name: 'Offentlig toalett' })).toBeInTheDocument()
    expect(screen.getByText('Ikke registrert')).toBeInTheDocument()
  })
})

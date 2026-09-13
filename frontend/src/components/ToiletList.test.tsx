import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { toilets } from '../test/fixtures'
import { ToiletList } from './ToiletList'

describe('ToiletList', () => {
  it('renders the empty state', () => {
    render(<ToiletList toilets={[]} onSelectToilet={() => undefined} />)

    expect(screen.getByText('Ingen toaletter funnet.')).toBeInTheDocument()
  })

  it('renders a custom empty message', () => {
    render(
      <ToiletList
        toilets={[]}
        emptyMessage="Ingen toaletter funnet innenfor 2 km."
        onSelectToilet={() => undefined}
      />,
    )

    expect(
      screen.getByText('Ingen toaletter funnet innenfor 2 km.'),
    ).toBeInTheDocument()
  })

  it('renders each toilet with its basic information', () => {
    render(<ToiletList toilets={toilets} onSelectToilet={() => undefined} />)

    expect(
      screen.getByRole('button', {
        name: 'Vis detaljer for Oslo Central Station',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('Tilgjengelig')).toBeInTheDocument()
    expect(screen.getByText('Ikke registrert')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Vis detaljer for Deichman Bjørvika',
      }),
    ).toBeInTheDocument()
  })

  it('uses the fallback name for an unnamed toilet', () => {
    render(
      <ToiletList
        toilets={[{ ...toilets[0], name: null }]}
        onSelectToilet={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Vis detaljer for Offentlig toalett',
      }),
    ).toHaveTextContent('Offentlig toalett')
  })

  it('renders distance when it is available', () => {
    render(
      <ToiletList
        toilets={[{ ...toilets[0], distanceMeters: 349.6 }]}
        onSelectToilet={() => undefined}
      />,
    )

    expect(screen.getByText('350 m unna')).toBeInTheDocument()
  })

  it('reports the selected toilet when an item is clicked', async () => {
    const user = userEvent.setup()
    const onSelectToilet = vi.fn()

    render(<ToiletList toilets={toilets} onSelectToilet={onSelectToilet} />)

    await user.click(
      screen.getByRole('button', {
        name: 'Vis detaljer for Oslo Central Station',
      }),
    )

    expect(onSelectToilet).toHaveBeenCalledOnce()
    expect(onSelectToilet).toHaveBeenCalledWith(toilets[0])
  })

  it('marks the currently selected toilet', () => {
    render(
      <ToiletList
        toilets={toilets}
        selectedToiletId={toilets[0].id}
        onSelectToilet={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Vis detaljer for Oslo Central Station',
      }),
    ).toHaveAttribute('aria-pressed', 'true')

    expect(
      screen.getByRole('button', {
        name: 'Vis detaljer for Deichman Bjørvika',
      }),
    ).toHaveAttribute('aria-pressed', 'false')
  })
})
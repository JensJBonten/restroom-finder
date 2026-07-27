import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { toilets } from '../test/fixtures'
import { ToiletList } from './ToiletList'

describe('ToiletList', () => {
  it('renders the empty state', () => {
    render(
      <ToiletList
        toilets={[]}
        onSelectToilet={() => undefined}
      />,
    )

    expect(
      screen.getByText('No toilets found.'),
    ).toBeInTheDocument()
  })

  it('renders a custom empty message', () => {
    render(
      <ToiletList
        toilets={[]}
        emptyMessage="No toilets found within 2 km."
        onSelectToilet={() => undefined}
      />,
    )

    expect(
      screen.getByText(
        'No toilets found within 2 km.',
      ),
    ).toBeInTheDocument()
  })

  it('renders each toilet with its basic information', () => {
    render(
      <ToiletList
        toilets={toilets}
        onSelectToilet={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'View details for Oslo Central Station',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Jernbanetorget 1'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Paid'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Public toilet'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'View details for Deichman Bjørvika',
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
      screen.getByText('Requires entry'),
    ).toBeInTheDocument()
  })

  it('renders distance when it is available', () => {
    render(
      <ToiletList
        toilets={[
          {
            ...toilets[0],
            distanceMeters: 349.6,
          },
        ]}
        onSelectToilet={() => undefined}
      />,
    )

    expect(
      screen.getByText('350 m away'),
    ).toBeInTheDocument()
  })

  it('reports the selected toilet when an item is clicked', async () => {
    const user = userEvent.setup()
    const onSelectToilet = vi.fn()

    render(
      <ToiletList
        toilets={toilets}
        onSelectToilet={onSelectToilet}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'View details for Oslo Central Station',
      }),
    )

    expect(onSelectToilet).toHaveBeenCalledOnce()

    expect(onSelectToilet).toHaveBeenCalledWith(
      toilets[0],
    )
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
        name: 'View details for Oslo Central Station',
      }),
    ).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    expect(
      screen.getByRole('button', {
        name: 'View details for Deichman Bjørvika',
      }),
    ).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { toilets } from '../test/fixtures'
import { ToiletDetailCard } from './ToiletDetailCard'

describe('ToiletDetailCard', () => {
  it('renders all relevant toilet information', () => {
    render(
      <ToiletDetailCard
        toilet={{
          ...toilets[0],
          distanceMeters: 349.6,
        }}
        onClose={() => undefined}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Oslo Central Station',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText('Jernbanetorget 1'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('350 m away'),
    ).toBeInTheDocument()

    expect(screen.getByText('Paid')).toBeInTheDocument()

    expect(
      screen.getByText('Public toilet'),
    ).toBeInTheDocument()

    expect(
      screen.getByText('No entry required'),
    ).toBeInTheDocument()

    expect(screen.getByText('4/5')).toBeInTheDocument()
  })

  it('links to Google Maps using walking mode', () => {
    render(
      <ToiletDetailCard
        toilet={toilets[0]}
        onClose={() => undefined}
      />,
    )

    const navigationLink = screen.getByRole('link', {
      name: 'Navigate with Google Maps',
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

    expect(navigationLink).toHaveAttribute(
      'target',
      '_blank',
    )
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <ToiletDetailCard
        toilet={toilets[0]}
        onClose={onClose}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Close details for Oslo Central Station',
      }),
    )

    expect(onClose).toHaveBeenCalledOnce()
  })
})
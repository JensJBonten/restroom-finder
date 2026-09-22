import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { toilets } from '../test/fixtures'
import { ToiletDetailCard } from './ToiletDetailCard'

describe('ToiletDetailCard', () => {
  it('renders all relevant toilet information', () => {
    render(
      <ToiletDetailCard
        toilet={{ ...toilets[0], distanceMeters: 349.6 }}
        onClose={() => undefined}
      />,
    )

    expect(
      screen.getByRole('heading', {
        name: 'Oslo Central Station',
      }),
    ).toBeInTheDocument()

    expect(screen.getByText('350 m unna')).toBeInTheDocument()
    expect(screen.getByText('Tilgjengelig')).toBeInTheDocument()
    expect(
      screen.getByText('Inngang ved hovedinngangen.'),
    ).toBeInTheDocument()
  })

  it.each([
    ['ACCESSIBLE', 'Tilgjengelig'],
    ['DIFFICULT_ACCESS', 'Vanskelig tilgjengelig'],
    ['NOT_ACCESSIBLE', 'Ikke tilgjengelig'],
    ['NOT_ASSESSED', 'Ikke vurdert'],
    [null, 'Ikke registrert'],
  ] as const)(
    'displays accessibility %s in Norwegian',
    (accessibilityStatus, label) => {
      render(
        <ToiletDetailCard
          toilet={{ ...toilets[0], accessibilityStatus }}
          onClose={() => undefined}
        />,
      )

      expect(screen.getByText(label)).toBeInTheDocument()
    },
  )

  it.each([null, ''])(
    'omits absent comments (%s) and handles nullable fields',
    (comments) => {
      const { container } = render(
        <ToiletDetailCard
          toilet={{
            ...toilets[0],
            name: null,
            comments,
          }}
          onClose={() => undefined}
        />,
      )

      expect(
        screen.getByRole('heading', {
          name: 'Offentlig toalett',
        }),
      ).toBeInTheDocument()

      expect(
        screen.getByRole('button', {
          name: 'Lukk detaljer for Offentlig toalett',
        }),
      ).toBeInTheDocument()

      expect(
        container.querySelector('.toilet-detail-card__comments'),
      ).toBeNull()
    },
  )

  it('does not expose the undocumented raw toilet type', () => {
    render(
      <ToiletDetailCard
        toilet={{ ...toilets[0], toiletType: '0' }}
        onClose={() => undefined}
      />,
    )

    expect(screen.queryByText('Type')).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('links to Google Maps using walking mode', () => {
    render(
      <ToiletDetailCard
        toilet={toilets[0]}
        onClose={() => undefined}
      />,
    )

    const navigationLink = screen.getByRole('link', {
      name: 'Åpne gangrute i Google Maps',
    })

    const navigationUrl = new URL(
      navigationLink.getAttribute('href') ?? '',
    )

    expect(navigationUrl.searchParams.get('destination'))
      .toBe('59.9109,10.7523')
    expect(navigationUrl.searchParams.get('travelmode')).toBe('walking')
    expect(navigationLink).toHaveAttribute('target', '_blank')
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
        name: 'Lukk detaljer for Oslo Central Station',
      }),
    )

    expect(onClose).toHaveBeenCalledOnce()
  })
})
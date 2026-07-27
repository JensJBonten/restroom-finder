import {
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  DEFAULT_TOILET_FILTERS,
  type ToiletFilters,
} from '../types/ToiletFilters'
import { ToiletFilterPanel } from './ToiletFilterPanel'

describe('ToiletFilterPanel', () => {
  it('renders every filter control', () => {
    render(
      <ToiletFilterPanel
        filters={DEFAULT_TOILET_FILTERS}
        onFiltersChange={() => undefined}
        onResetFilters={() => undefined}
        onClose={() => undefined}
      />,
    )

    expect(
      screen.getByRole('checkbox', {
        name: /free only/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('checkbox', {
        name: /public toilets only/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('checkbox', {
        name: /no entry required/i,
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('combobox', {
        name: 'Minimum cleanliness',
      }),
    ).toBeInTheDocument()
  })

  it('shows the supplied filter values', () => {
    const filters: ToiletFilters = {
      ...DEFAULT_TOILET_FILTERS,
      freeOnly: true,
      minimumCleanlinessRating: 4,
    }

    render(
      <ToiletFilterPanel
        filters={filters}
        onFiltersChange={() => undefined}
        onResetFilters={() => undefined}
        onClose={() => undefined}
      />,
    )

    expect(
      screen.getByRole('checkbox', {
        name: /free only/i,
      }),
    ).toBeChecked()

    expect(
      screen.getByRole('combobox', {
        name: 'Minimum cleanliness',
      }),
    ).toHaveValue('4')
  })

  it('reports an updated checkbox value', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()

    render(
      <ToiletFilterPanel
        filters={DEFAULT_TOILET_FILTERS}
        onFiltersChange={onFiltersChange}
        onResetFilters={() => undefined}
        onClose={() => undefined}
      />,
    )

    await user.click(
      screen.getByRole('checkbox', {
        name: /free only/i,
      }),
    )

    expect(
      onFiltersChange,
    ).toHaveBeenCalledWith({
      ...DEFAULT_TOILET_FILTERS,
      freeOnly: true,
    })
  })

  it('reports an updated minimum rating', async () => {
    const user = userEvent.setup()
    const onFiltersChange = vi.fn()

    render(
      <ToiletFilterPanel
        filters={DEFAULT_TOILET_FILTERS}
        onFiltersChange={onFiltersChange}
        onResetFilters={() => undefined}
        onClose={() => undefined}
      />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Minimum cleanliness',
      }),
      '4',
    )

    expect(
      onFiltersChange,
    ).toHaveBeenCalledWith({
      ...DEFAULT_TOILET_FILTERS,
      minimumCleanlinessRating: 4,
    })
  })

  it('calls the reset callback when filters are active', async () => {
    const user = userEvent.setup()
    const onResetFilters = vi.fn()

    render(
      <ToiletFilterPanel
        filters={{
          ...DEFAULT_TOILET_FILTERS,
          publicOnly: true,
        }}
        onFiltersChange={() => undefined}
        onResetFilters={onResetFilters}
        onClose={() => undefined}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Reset filters',
      }),
    )

    expect(
      onResetFilters,
    ).toHaveBeenCalledOnce()
  })

  it('disables reset when no filters are active', () => {
    render(
      <ToiletFilterPanel
        filters={DEFAULT_TOILET_FILTERS}
        onFiltersChange={() => undefined}
        onResetFilters={() => undefined}
        onClose={() => undefined}
      />,
    )

    expect(
      screen.getByRole('button', {
        name: 'Reset filters',
      }),
    ).toBeDisabled()
  })

  it('calls the close callback', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <ToiletFilterPanel
        filters={DEFAULT_TOILET_FILTERS}
        onFiltersChange={() => undefined}
        onResetFilters={() => undefined}
        onClose={onClose}
      />,
    )

    await user.click(
      screen.getByRole('button', {
        name: 'Close filters',
      }),
    )

    expect(onClose).toHaveBeenCalledOnce()
  })
})
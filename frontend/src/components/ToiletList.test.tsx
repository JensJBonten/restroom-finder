import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { toilets } from '../test/fixtures'
import { ToiletList } from './ToiletList'

describe('ToiletList', () => {
  it('renders the empty state', () => {
    render(<ToiletList toilets={[]} />)

    expect(screen.getByText('No toilets found.')).toBeInTheDocument()
  })

  it('renders each toilet with its basic information', () => {
    render(<ToiletList toilets={toilets} />)

    expect(
      screen.getByRole('heading', { name: 'Oslo Central Station' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Jernbanetorget 1')).toBeInTheDocument()
    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.getByText('Public toilet')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Deichman Bjørvika' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Anne-Cath. Vestlys plass 1'),
    ).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Requires entry')).toBeInTheDocument()
  })
})

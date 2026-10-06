import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingPanel } from './LoadingPanel'

describe('LoadingPanel', () => {
  it('communicates that dashboard data is loading', () => {
    render(<LoadingPanel />)
    expect(screen.getByText('Loading dashboard data')).toBeInTheDocument()
    expect(screen.getByText('INITIALIZING OPERATIONS')).toBeInTheDocument()
  })
})

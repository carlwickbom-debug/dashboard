import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DashboardPanel } from './layout/DashboardLayout'
import { DataFreshnessIndicator } from './status/DataFreshnessIndicator'
import { SeverityBadge } from './status/SeverityBadge'
import { StatusIndicator } from './status/StatusIndicator'
import { EmptyState, ErrorState } from './status/States'

afterEach(cleanup)

describe('operational design system', () => {
  it('renders panel title, status, toolbar, content, and footer semantics', () => {
    render(<DashboardPanel title="Network" subtitle="Regional telemetry" status="CRITICAL" timestamp="09:42 UTC" toolbar={<button type="button">Export</button>} footer={<span>Source: mesh</span>}>Operational view</DashboardPanel>)
    expect(screen.getByRole('heading', { name: 'Network' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: /critical/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument()
    expect(screen.getByText('Operational view')).toBeInTheDocument()
    expect(screen.getByText('Source: mesh')).toBeInTheDocument()
  })

  it('renders severity, status, and freshness as accessible state primitives', () => {
    render(<><SeverityBadge severity="HIGH" description="Elevated latency" /><StatusIndicator status="WARNING" label="Attention" description="Monitor telemetry" /><DataFreshnessIndicator freshness="STALE" updatedAt="09:42 UTC" /></>)
    expect(screen.getAllByRole('status')).toHaveLength(3)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('Attention')).toBeInTheDocument()
    expect(screen.getByText('STALE')).toBeInTheDocument()
  })

  it('renders descriptive empty and error states', () => {
    render(<><EmptyState title="No events" description="No active events are present." /><ErrorState description="The source could not be reached." /></>)
    expect(screen.getByText('No events')).toBeInTheDocument()
    expect(screen.getByText('No active events are present.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Data source unavailable')
  })
})

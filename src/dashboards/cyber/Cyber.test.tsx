import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Cyber, type CyberData } from './Cyber'

const data: CyberData = {
  snapshot: { status: 'CRITICAL', health: 78, headline: 'Critical vulnerabilities require immediate review', updatedAt: '09:36 UTC', source: 'Defensive vulnerability intelligence', freshness: 'FRESH', summary: 'Multiple critical findings require review.' },
  vulnerabilities: [
    { id: 'vuln-1', cve: 'CVE-2025-53770', vendor: 'Microsoft', product: 'SharePoint', version: 'All supported', cvss: 9.8, severity: 'CRITICAL', cisaKev: true, dateAdded: '2026-09-20', dueDate: '2026-09-30', published: '2026-09-20', lastModified: '2026-09-23', description: 'Remote code execution in SharePoint.', exploitAvailable: true, affectedCountries: ['Sweden'], status: 'OPEN' },
    { id: 'vuln-2', cve: 'CVE-2024-3400', vendor: 'Palo Alto', product: 'PAN-OS', version: '11.2', cvss: 9.8, severity: 'CRITICAL', cisaKev: true, dateAdded: '2024-05-07', dueDate: '2024-05-22', published: '2024-05-07', lastModified: '2026-09-17', description: 'Authentication bypass in PAN-OS.', exploitAvailable: true, affectedCountries: ['Norway'], status: 'IN_PROGRESS' },
    { id: 'vuln-3', cve: 'CVE-2024-6387', vendor: 'OpenSSH', product: 'OpenSSH', version: '9.7p1', cvss: 8.1, severity: 'HIGH', cisaKev: false, dateAdded: '2024-07-01', dueDate: '2024-08-15', published: '2024-07-01', lastModified: '2026-08-28', description: 'SSH signal race condition.', exploitAvailable: true, affectedCountries: ['Finland'], status: 'OPEN' },
  ],
  providers: [{ name: 'CISA KEV FEED', freshness: 'FRESH', latency: '18 ms', status: 'OK' }],
  events: [{ id: 'event-1', timestamp: '09:24 UTC', source: 'Identity analytics', country: 'Finland', category: 'Credential', severity: 'HIGH', title: 'Authentication pattern detected', description: 'A credential spray pattern was detected.', affectedVendor: 'Microsoft', affectedProduct: 'Entra ID', cve: undefined, relatedDashboard: 'cyber' }],
  abnormalEvents: [{ id: 'event-2', timestamp: '09:10 UTC', source: 'Remediation workflow', country: 'Sweden', category: 'Remediation', severity: 'CRITICAL', title: 'Overdue critical remediation', description: 'A critical vulnerability exceeded its deadline.', affectedVendor: 'Microsoft', affectedProduct: 'SharePoint', cve: 'CVE-2025-53770', relatedDashboard: 'cyber' }],
  source: 'Mock Nordic vulnerability intelligence provider',
}

describe('Cyber Security dashboard', () => {
  it('renders defensive vulnerability overview, filters, and priority data', () => {
    render(<Cyber data={data} />)
    expect(screen.getByRole('heading', { name: 'Cyber risk posture' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'CISA KEV' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Critical findings' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Vulnerability inventory' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Abnormal cyber events' })).toBeInTheDocument()
    expect(screen.getByText('CVE-2025-53770')).toBeInTheDocument()
    expect(screen.getAllByText('CISA KEV').length).toBeGreaterThan(0)
    expect(screen.getAllByText('OVERDUE').length).toBeGreaterThan(0)
    expect(screen.getByText('Country')).toBeInTheDocument()
    expect(screen.getByText('Vendor')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Severity')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Severity'), { target: { value: 'CRITICAL' } })
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument()
  })
})

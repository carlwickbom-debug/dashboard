import type { DashboardDefinition } from '../../data/models'
import { createMockProvider } from '../../data/providers/mockProvider'
import { events } from '../../data/mock/mockData'
import { Cyber, type CyberData, type Vulnerability } from './Cyber'

const vulnerabilities: Vulnerability[] = [
  { id: 'vuln-1', cve: 'CVE-2025-53770', vendor: 'Microsoft', product: 'Microsoft SharePoint', version: 'All supported', cvss: 9.8, severity: 'CRITICAL', cisaKev: true, dateAdded: '2025-07-09', dueDate: '2025-07-20', published: '2025-07-09', lastModified: '2026-09-23', description: 'Microsoft SharePoint Server remote code execution through crafted content.', exploitAvailable: true, affectedCountries: ['Sweden', 'Finland', 'Norway'], status: 'OPEN' },
  { id: 'vuln-2', cve: 'CVE-2024-3400', vendor: 'Palo Alto', product: 'Palo Alto Networks PAN-OS', version: '11.2 and earlier', cvss: 9.8, severity: 'CRITICAL', cisaKev: true, dateAdded: '2024-05-07', dueDate: '2024-05-22', published: '2024-05-07', lastModified: '2026-09-17', description: 'Authentication bypass enabling command execution in PAN-OS firewalls.', exploitAvailable: true, affectedCountries: ['Denmark', 'Sweden', 'Norway'], status: 'IN_PROGRESS' },
  { id: 'vuln-3', cve: 'CVE-2023-22515', vendor: 'Atlassian', product: 'Confluence', version: '8.0 through 8.5', cvss: 10, severity: 'CRITICAL', cisaKev: true, dateAdded: '2023-11-02', dueDate: '2023-11-21', published: '2023-10-30', lastModified: '2026-09-14', description: 'Confluence privilege escalation and remote code execution.', exploitAvailable: true, affectedCountries: ['Finland'], status: 'OPEN' },
  { id: 'vuln-4', cve: 'CVE-2024-6387', vendor: 'OpenSSH', product: 'OpenSSH server', version: '8.5p1 through 9.7p1', cvss: 8.1, severity: 'HIGH', cisaKev: false, dateAdded: '2024-07-01', dueDate: '2024-08-15', published: '2024-07-01', lastModified: '2026-08-28', description: 'Signal handler race condition in SSH servers that may permit remote code execution.', exploitAvailable: true, affectedCountries: ['Norway', 'Sweden', 'Finland', 'Denmark'], status: 'IN_PROGRESS' },
  { id: 'vuln-5', cve: 'CVE-2025-30065', vendor: 'Apache', product: 'Apache Parquet', version: '1.15.0 and earlier', cvss: 8.8, severity: 'HIGH', cisaKev: false, dateAdded: '2025-03-18', dueDate: '2025-05-30', published: '2025-03-18', lastModified: '2026-08-20', description: 'Parquet Java reader can execute code from untrusted data.', exploitAvailable: false, affectedCountries: ['Iceland'], status: 'OPEN' },
  { id: 'vuln-6', cve: 'CVE-2026-41208', vendor: 'Kubernetes', product: 'Kubernetes API server', version: '1.30 through 1.33', cvss: 7.5, severity: 'HIGH', cisaKev: false, dateAdded: '2026-09-10', dueDate: '2026-10-05', published: '2026-09-10', lastModified: '2026-09-12', description: 'Kubernetes API server authorization bypass for certain aggregated APIs.', exploitAvailable: false, affectedCountries: ['Sweden', 'Finland'], status: 'OPEN' },
  { id: 'vuln-7', cve: 'CVE-2023-4863', vendor: 'Google', product: 'Chromium', version: 'Before 116.0.5845.187', cvss: 8.8, severity: 'HIGH', cisaKev: true, dateAdded: '2023-09-25', dueDate: '2023-10-10', published: '2023-09-25', lastModified: '2026-09-10', description: 'Heap buffer overflow in WebP image processing used by Chromium-based applications.', exploitAvailable: true, affectedCountries: ['Denmark', 'Iceland'], status: 'MITIGATED' },
  { id: 'vuln-8', cve: 'CVE-2025-21176', vendor: 'Citrix', product: 'Citrix NetScaler', version: '16.1 and earlier', cvss: 9.2, severity: 'CRITICAL', cisaKev: false, dateAdded: '2025-01-19', dueDate: '2025-03-10', published: '2025-01-19', lastModified: '2026-08-04', description: 'Remote code execution in Citrix NetScaler appliance administrative interface.', exploitAvailable: false, affectedCountries: ['Norway'], status: 'OPEN' },
  { id: 'vuln-9', cve: 'CVE-2026-30129', vendor: 'Akka', product: 'Akka HTTP', version: '1.5.0 through 1.5.8', cvss: 6.5, severity: 'MEDIUM', cisaKev: false, dateAdded: '2026-08-14', dueDate: '2026-10-01', published: '2026-08-14', lastModified: '2026-08-15', description: 'HTTP request smuggling condition in Akka HTTP.', exploitAvailable: false, affectedCountries: ['Finland'], status: 'IN_PROGRESS' },
  { id: 'vuln-10', cve: 'CVE-2025-55908', vendor: 'OpenSSL', product: 'OpenSSL', version: '3.0.0 through 3.0.16', cvss: 5.3, severity: 'MEDIUM', cisaKev: false, dateAdded: '2025-09-02', dueDate: '2025-12-15', published: '2025-09-02', lastModified: '2026-07-29', description: 'Potential denial of service in X.509 name constraint processing.', exploitAvailable: false, affectedCountries: ['Sweden', 'Norway'], status: 'MITIGATED' },
]

const data: CyberData = {
  snapshot: { status: 'CRITICAL', health: 78, headline: 'Critical vulnerabilities require immediate review', updatedAt: '09:36 UTC', source: 'Defensive vulnerability intelligence', freshness: 'FRESH', summary: 'Multiple critical findings and CISA KEV entries are present across Nordic environments.' },
  vulnerabilities,
  providers: [
    { name: 'CISA KEV FEED', freshness: 'FRESH', latency: '18 ms', status: 'OK' },
    { name: 'VULNERABILITY SCAN', freshness: 'LIVE', latency: '42 ms', status: 'OK' },
    { name: 'ASSET INVENTORY', freshness: 'STALE', latency: '184 ms', status: 'WARNING' },
    { name: 'REMEDIATION WORKFLOW', freshness: 'FRESH', latency: '72 ms', status: 'OK' },
  ],
  events: [
    { ...events.cyber[0], country: 'Sweden', affectedVendor: 'Microsoft', affectedProduct: 'SharePoint', cve: 'CVE-2025-53770', relatedDashboard: 'cyber' },
    { id: 'cyber-event-2', timestamp: '09:18 UTC', source: 'Vulnerability scanner', country: 'Norway', category: 'Vulnerability', severity: 'HIGH', title: 'Critical设备 firmware finding', description: 'An unsupported firmware version was detected on a managed gateway.', affectedVendor: 'Palo Alto', affectedProduct: 'PAN-OS', cve: 'CVE-2024-3400', relatedDashboard: 'cyber' },
  ],
  abnormalEvents: [
    { id: 'cyber-abnormal-1', timestamp: '09:24 UTC', source: 'Identity analytics', country: 'Finland', category: 'Credential', severity: 'HIGH', title: 'Multi-source authentication pattern detected', description: 'A credential spray pattern was detected across several identity sources.', affectedVendor: 'Microsoft', affectedProduct: 'Entra ID', cve: undefined, relatedDashboard: 'cyber' },
    { id: 'cyber-abnormal-2', timestamp: '09:10 UTC', source: 'Remediation workflow', country: 'Sweden', category: 'Remediation', severity: 'CRITICAL', title: 'Overdue critical remediation', description: 'A critical vulnerability has exceeded its remediation deadline.', affectedVendor: 'Microsoft', affectedProduct: 'SharePoint', cve: 'CVE-2025-53770', relatedDashboard: 'cyber' },
  ],
  source: 'Mock Nordic vulnerability intelligence provider',
}

export const cyberProvider: DashboardDefinition<CyberData> = { id: 'cyber', name: 'CYBER SECURITY', description: 'Defensive vulnerability monitoring, exploitation status, remediation posture and Nordic exposure.', icon: 'shield', category: 'Security', component: Cyber, enabled: true, provider: createMockProvider('cyber', data) }

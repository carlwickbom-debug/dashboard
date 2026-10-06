import { describe, expect, it } from 'vitest'
import { normalizeSeverity, severityRank } from './normalization'

describe('severity model', () => {
  it('normalizes unknown values to INFO', () => expect(normalizeSeverity('unknown')).toBe('INFO'))
  it('orders severities from informational to critical', () => expect(severityRank('INFO')).toBeLessThan(severityRank('LOW')))
  it('preserves valid severity values', () => expect(normalizeSeverity('critical')).toBe('CRITICAL'))
})

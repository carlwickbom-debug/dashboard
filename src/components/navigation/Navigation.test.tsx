import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Navigation } from './Navigation'

const items = [{ id: 'energy', name: 'ENERGY', category: 'Infrastructure', icon: 'zap' }]

describe('navigation', () => {
  it('renders registry-derived labels and selects a dashboard', () => {
    const onSelect = vi.fn()
    render(<Navigation items={items} activeId="energy" onSelect={onSelect} />)
    expect(screen.getByRole('button', { name: /energy/i })).toHaveClass('active')
    screen.getByRole('button', { name: /energy/i }).click()
    expect(onSelect).toHaveBeenCalledWith('energy')
  })
})

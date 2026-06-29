import { describe, expect, it } from 'vitest'
import { computeSalesTotal, salesToCsv } from './exportService'
import type { Sale } from '../shared/types'

const sales: Sale[] = [
  { id: 'a1b2c3d4', total: 12.5, createdAt: '2026-01-10T10:00:00.000Z' },
  { id: 'e5f6g7h8', total: 7.25, createdAt: '2026-01-10T11:30:00.000Z' }
]

describe('exportService', () => {
  it('computes the total of all sales', () => {
    expect(computeSalesTotal(sales)).toBe(19.75)
  })

  it('returns 0 for no sales', () => {
    expect(computeSalesTotal([])).toBe(0)
  })

  it('generates a CSV with a header and one row per sale', () => {
    const csv = salesToCsv(sales)
    const lines = csv.split('\n')

    expect(lines).toHaveLength(3)
    expect(lines[0]).toBe('Ticket;Date;Total (EUR)')
    expect(lines[1]).toContain('a1b2c3d4')
    expect(lines[1]).toContain('12.50')
  })
})

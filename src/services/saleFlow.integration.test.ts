import { describe, expect, it } from 'vitest'
import { salesToCsv } from './exportService'
import { buildSale } from './saleService'
import type { Sale } from '../shared/types'

describe('sale flow integration', () => {
  it('builds a sale from cart lines and exports it to CSV', () => {
    const builtSale = buildSale([
      { productId: 'p1', productName: 'Nutella', quantity: 2, unitPrice: 3.5 },
      { productId: 'p2', productName: 'Lait', quantity: 1, unitPrice: 1.2 }
    ])

    const sale: Sale = {
      id: 'ticket-001',
      total: builtSale.total,
      createdAt: '2026-06-28T20:00:00.000Z'
    }

    const csv = salesToCsv([sale])

    expect(builtSale.total).toBe(8.2)
    expect(builtSale.lines).toHaveLength(2)
    expect(csv).toContain('ticket-001')
    expect(csv).toContain('8.20')
  })
})

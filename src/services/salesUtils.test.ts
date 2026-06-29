import { describe, expect, it } from 'vitest'
import { filterSalesByDay } from './salesUtils'
import type { Sale } from '../shared/types'

const sales: Sale[] = [
  { id: '1', total: 10, createdAt: '2026-06-28T10:00:00.000Z' },
  { id: '2', total: 5, createdAt: '2026-06-27T10:00:00.000Z' },
  { id: '3', total: 7, createdAt: '2026-06-28T18:00:00.000Z' }
]

describe('salesUtils', () => {
  it('filters sales for a given day', () => {
    const result = filterSalesByDay(sales, new Date('2026-06-28T12:00:00.000Z'))

    expect(result).toHaveLength(2)
    expect(result.map((sale) => sale.id)).toEqual(['1', '3'])
  })

  it('returns an empty list when no sale matches the day', () => {
    expect(filterSalesByDay(sales, new Date('2026-01-01T12:00:00.000Z'))).toEqual([])
  })
})

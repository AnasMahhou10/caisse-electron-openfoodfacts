import { describe, expect, it } from 'vitest'
import { calculateCartTotal, calculateLineTotal } from './cartService'

describe('cartService', () => {
  it('returns 0 for an empty cart', () => {
    expect(calculateCartTotal([])).toBe(0)
  })

  it('calculates a line total from quantity and unit price', () => {
    expect(
      calculateLineTotal({
        productId: 'p1',
        productName: 'Cafe',
        quantity: 3,
        unitPrice: 2.5
      })
    ).toBe(7.5)
  })

  it('calculates the full cart total', () => {
    expect(
      calculateCartTotal([
        { productId: 'p1', productName: 'Cafe', quantity: 2, unitPrice: 2.5 },
        { productId: 'p2', productName: 'Lait', quantity: 1, unitPrice: 1.2 }
      ])
    ).toBe(6.2)
  })

  it('rejects negative prices', () => {
    expect(() =>
      calculateLineTotal({
        productId: 'p1',
        productName: 'Cafe',
        quantity: 1,
        unitPrice: -1
      })
    ).toThrow('prix unitaire')
  })
})

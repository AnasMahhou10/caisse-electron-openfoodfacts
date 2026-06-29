import { describe, expect, it } from 'vitest'
import { buildSale } from './saleService'

describe('saleService', () => {
  it('throws on an empty cart', () => {
    expect(() => buildSale([])).toThrow('panier est vide')
  })

  it('builds a sale with line totals and global total', () => {
    const sale = buildSale([
      { productId: 'p1', productName: 'Cafe', quantity: 2, unitPrice: 2.5 },
      { productId: 'p2', productName: 'Lait', quantity: 3, unitPrice: 1 }
    ])

    expect(sale.total).toBe(8)
    expect(sale.lines).toHaveLength(2)
    expect(sale.lines[0].lineTotal).toBe(5)
    expect(sale.lines[1].lineTotal).toBe(3)
  })

  it('rejects an invalid quantity', () => {
    expect(() =>
      buildSale([{ productId: 'p1', productName: 'Cafe', quantity: 0, unitPrice: 2.5 }])
    ).toThrow('quantite')
  })
})

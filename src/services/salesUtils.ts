import type { Sale } from '../shared/types'

export function filterSalesByDay(sales: Sale[], date = new Date()): Sale[] {
  const day = date.toISOString().slice(0, 10)

  return sales.filter((sale) => sale.createdAt.slice(0, 10) === day)
}

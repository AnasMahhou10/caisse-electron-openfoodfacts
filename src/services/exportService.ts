import type { Sale } from '../shared/types'

function escapeCsvValue(value: string | number): string {
  const text = String(value)

  if (/[";\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

/**
 * Transforme une liste de ventes en CSV (separateur ';' pour Excel FR).
 * Logique pure et testable, independante d'Electron.
 */
export function salesToCsv(sales: Sale[]): string {
  const header = ['Ticket', 'Date', 'Total (EUR)']
  const rows = sales.map((sale) => [
    sale.id,
    new Date(sale.createdAt).toLocaleString('fr-FR'),
    sale.total.toFixed(2)
  ])

  return [header, ...rows].map((columns) => columns.map(escapeCsvValue).join(';')).join('\n')
}

export function computeSalesTotal(sales: Sale[]): number {
  return Number(sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2))
}

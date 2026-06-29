import type { CartLine } from '../shared/types'

export function calculateLineTotal(line: CartLine): number {
  if (line.quantity <= 0) {
    throw new Error('La quantite doit etre superieure a 0.')
  }

  if (line.unitPrice < 0) {
    throw new Error('Le prix unitaire ne peut pas etre negatif.')
  }

  return Number((line.quantity * line.unitPrice).toFixed(2))
}

export function calculateCartTotal(lines: CartLine[]): number {
  return Number(lines.reduce((total, line) => total + calculateLineTotal(line), 0).toFixed(2))
}

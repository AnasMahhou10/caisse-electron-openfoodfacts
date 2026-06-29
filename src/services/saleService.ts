import type { CartLine } from '../shared/types'
import { calculateCartTotal, calculateLineTotal } from './cartService'

export interface BuiltSaleLine extends CartLine {
  lineTotal: number
}

export interface BuiltSale {
  total: number
  lines: BuiltSaleLine[]
}

/**
 * Construit une vente a partir d'un panier : valide le contenu et calcule
 * les totaux. La logique est pure (sans Electron ni stockage) pour rester
 * facilement testable.
 */
export function buildSale(cart: CartLine[]): BuiltSale {
  if (cart.length === 0) {
    throw new Error('Le panier est vide.')
  }

  const lines = cart.map((line) => ({
    ...line,
    lineTotal: calculateLineTotal(line)
  }))

  return {
    total: calculateCartTotal(cart),
    lines
  }
}

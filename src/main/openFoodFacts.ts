import type { OffLookupResult } from '../shared/types'

const OFF_ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product'
const OFF_FIELDS = 'code,product_name,product_name_fr,brands,image_front_url,image_url'
const REQUEST_TIMEOUT_MS = 7000

interface OffApiResponse {
  status?: number
  product?: {
    code?: string
    product_name?: string
    product_name_fr?: string
    brands?: string
    image_front_url?: string
    image_url?: string
  }
}

function sanitizeBarcode(barcode: string): string {
  return barcode.replace(/\D/g, '')
}

/**
 * Recherche un produit dans OpenFoodFacts via son code-barres.
 * Distingue les deux logiques metier : produit connu (found) et produit
 * inconnu (not_found). En cas de coupure reseau, renvoie le statut offline
 * pour que l'interface bascule vers la saisie manuelle.
 */
export async function lookupProductByBarcode(rawBarcode: string): Promise<OffLookupResult> {
  const barcode = sanitizeBarcode(rawBarcode ?? '')

  if (!barcode) {
    return { status: 'error', message: 'Code-barres invalide.' }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const url = `${OFF_ENDPOINT}/${barcode}.json?fields=${OFF_FIELDS}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CaisseEpicerie/1.0 (projet etudiant Electron)'
      },
      signal: controller.signal
    })

    if (!response.ok) {
      return { status: 'error', message: `Reponse OpenFoodFacts: ${response.status}` }
    }

    const data = (await response.json()) as OffApiResponse

    if (data.status !== 1 || !data.product) {
      return { status: 'not_found' }
    }

    const product = data.product
    const name = product.product_name_fr || product.product_name

    if (!name) {
      return { status: 'not_found' }
    }

    return {
      status: 'found',
      product: {
        barcode,
        name,
        brand: product.brands?.split(',')[0]?.trim() || undefined,
        imageUrl: product.image_front_url || product.image_url || undefined
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { status: 'offline', message: 'Delai depasse. Verifiez la connexion.' }
    }

    return { status: 'offline', message: 'Pas de connexion a OpenFoodFacts.' }
  } finally {
    clearTimeout(timeout)
  }
}

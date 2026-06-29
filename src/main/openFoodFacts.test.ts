import { afterEach, describe, expect, it, vi } from 'vitest'
import { lookupProductByBarcode } from './openFoodFacts'

function mockFetchResponse(payload: unknown, ok = true, status = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: () => Promise.resolve(payload)
    })
  )
}

describe('openFoodFacts', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns found with enriched product data when OpenFoodFacts knows the barcode', async () => {
    mockFetchResponse({
      status: 1,
      product: {
        product_name_fr: 'Pâte à tartiner Nutella',
        brands: 'Ferrero, Nutella',
        image_front_url: 'https://example.com/nutella.jpg'
      }
    })

    const result = await lookupProductByBarcode('3017620422003')

    expect(result).toEqual({
      status: 'found',
      product: {
        barcode: '3017620422003',
        name: 'Pâte à tartiner Nutella',
        brand: 'Ferrero',
        imageUrl: 'https://example.com/nutella.jpg'
      }
    })
  })

  it('returns not_found when the barcode is unknown', async () => {
    mockFetchResponse({ status: 0 })

    await expect(lookupProductByBarcode('0000000000000')).resolves.toEqual({
      status: 'not_found'
    })
  })

  it('returns offline when the API request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await lookupProductByBarcode('3017620422003')

    expect(result.status).toBe('offline')
  })

  it('sanitizes the barcode before calling OpenFoodFacts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 0 })
    })
    vi.stubGlobal('fetch', fetchMock)

    await lookupProductByBarcode(' 3017-6204-2200-3 ')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/3017620422003.json'),
      expect.any(Object)
    )
  })
})

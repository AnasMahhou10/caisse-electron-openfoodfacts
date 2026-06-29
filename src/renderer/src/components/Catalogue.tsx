import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { Product, ProductPayload, ProductSource } from '../../../shared/types'

interface CatalogueProps {
  products: Product[]
  isLoading: boolean
  onCreate: (payload: ProductPayload) => Promise<void>
  onUpdatePrice: (product: Product, price: number) => Promise<void>
  onDelete: (product: Product) => Promise<void>
}

const emptyForm: ProductPayload = {
  barcode: '',
  name: '',
  brand: '',
  price: 0,
  source: 'manual'
}

function Catalogue({
  products,
  isLoading,
  onCreate,
  onUpdatePrice,
  onDelete
}: CatalogueProps): React.JSX.Element {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<ProductPayload>(emptyForm)
  const [source, setSource] = useState<ProductSource>('manual')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isLooking, setIsLooking] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState(0)

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return products
    }

    return products.filter((product) =>
      [product.name, product.brand, product.barcode].some((value) =>
        value?.toLowerCase().includes(query)
      )
    )
  }, [products, search])

  async function handleLookup(): Promise<void> {
    if (!form.barcode?.trim()) {
      return
    }

    setError(null)
    setInfo(null)
    setIsLooking(true)

    try {
      const result = await window.api.off.lookup(form.barcode)

      if (result.status === 'found' && result.product) {
        setForm((current) => ({
          ...current,
          name: result.product!.name,
          brand: result.product!.brand ?? '',
          imageUrl: result.product!.imageUrl
        }))
        setSource('off')
        setInfo(t('form.found'))
      } else if (result.status === 'not_found') {
        setSource('manual')
        setInfo(t('form.notFound'))
      } else {
        setSource('manual')
        setInfo(t('form.offline'))
      }
    } finally {
      setIsLooking(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setError(null)

    try {
      await onCreate({ ...form, price: Number(form.price), source })
      setForm(emptyForm)
      setSource('manual')
      setInfo(null)
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Produit invalide.')
    }
  }

  function startEditPrice(product: Product): void {
    setEditingId(product.id)
    setEditPrice(product.price)
  }

  async function savePrice(product: Product): Promise<void> {
    try {
      await onUpdatePrice(product, editPrice)
      setEditingId(null)
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Prix invalide.')
    }
  }

  const count = filteredProducts.length
  const countLabel = t('catalogue.count', { count })

  return (
    <section className="content-grid">
      <form className="card product-form" onSubmit={handleSubmit}>
        <div>
          <p className="section-label">{t('form.manualEntry')}</p>
          <h2>{t('form.newProduct')}</h2>
        </div>

        <label>
          {t('form.barcode')}
          <div className="inline-field">
            <input
              value={form.barcode}
              onChange={(event) => setForm({ ...form, barcode: event.target.value })}
              placeholder="3017620422003"
            />
            <button type="button" onClick={handleLookup} disabled={isLooking}>
              {isLooking ? t('form.searching') : t('form.lookup')}
            </button>
          </div>
        </label>

        <label>
          {t('form.name')} *
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>

        <label>
          {t('form.brand')}
          <input
            value={form.brand}
            onChange={(event) => setForm({ ...form, brand: event.target.value })}
            placeholder={t('form.brandPlaceholder')}
          />
        </label>

        <label>
          {t('form.price')} *
          <input
            required
            min="0"
            step="0.01"
            type="number"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
          />
        </label>

        {info && <p className="info-message">{info}</p>}
        {form.imageUrl && (
          <div className="product-preview">
            <p className="section-label">{t('form.preview')}</p>
            <img src={form.imageUrl} alt={form.name || t('form.newProduct')} />
          </div>
        )}
        {error && <p className="error-message">{error}</p>}

        <button type="submit">{t('form.add')}</button>
      </form>

      <section className="card product-list">
        <div className="list-header">
          <div>
            <p className="section-label">{t('catalogue.heading')}</p>
            <h2>{countLabel}</h2>
          </div>
          <input
            className="search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('catalogue.search')}
          />
        </div>

        {isLoading ? (
          <p className="empty-state">{t('catalogue.loading')}</p>
        ) : count === 0 ? (
          <p className="empty-state">{t('catalogue.empty')}</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t('catalogue.colProduct')}</th>
                  <th>{t('catalogue.colBarcode')}</th>
                  <th>{t('catalogue.colSource')}</th>
                  <th>{t('catalogue.colPrice')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        {product.imageUrl && (
                          <img
                            className="product-thumb"
                            src={product.imageUrl}
                            alt={product.name}
                          />
                        )}
                        <div>
                          <strong>{product.name}</strong>
                          {product.brand && <span>{product.brand}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{product.barcode || '-'}</td>
                    <td>
                      {product.source === 'off'
                        ? t('catalogue.sourceOff')
                        : t('catalogue.sourceManual')}
                    </td>
                    <td>
                      {editingId === product.id ? (
                        <div className="inline-field">
                          <input
                            className="qty-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editPrice}
                            onChange={(event) => setEditPrice(Number(event.target.value))}
                          />
                          <button type="button" onClick={() => savePrice(product)}>
                            {t('catalogue.savePrice')}
                          </button>
                        </div>
                      ) : (
                        `${product.price.toFixed(2)} €`
                      )}
                    </td>
                    <td>
                      <div className="row-actions">
                        {editingId !== product.id && (
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => startEditPrice(product)}
                          >
                            {t('catalogue.editPrice')}
                          </button>
                        )}
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => onDelete(product)}
                        >
                          {t('catalogue.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

export default Catalogue

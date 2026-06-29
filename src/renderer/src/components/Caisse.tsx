import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CartLine, Product } from '../../../shared/types'

interface CaisseProps {
  products: Product[]
  onSaleValidated: () => void
}

function Caisse({ products, onSaleValidated }: CaisseProps): React.JSX.Element {
  const { t } = useTranslation()
  const [cart, setCart] = useState<CartLine[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [barcode, setBarcode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const total = useMemo(
    () => Number(cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0).toFixed(2)),
    [cart]
  )

  function addProductToCart(product: Product): void {
    setMessage(null)
    setError(null)
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id)

      if (existing) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line
        )
      }

      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price
        }
      ]
    })
  }

  function addToCart(): void {
    const product = products.find((item) => item.id === selectedId)

    if (!product) {
      return
    }

    addProductToCart(product)
  }

  function addByBarcode(): void {
    const normalized = barcode.replace(/\D/g, '')

    if (!normalized) {
      return
    }

    const product = products.find((item) => item.barcode?.replace(/\D/g, '') === normalized)

    if (!product) {
      setError(t('cash.productNotFound'))
      return
    }

    addProductToCart(product)
    setBarcode('')
  }

  function changeQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      setCart((current) => current.filter((line) => line.productId !== productId))
      return
    }

    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity } : line))
    )
  }

  function removeLine(productId: string): void {
    setCart((current) => current.filter((line) => line.productId !== productId))
  }

  async function validateSale(): Promise<void> {
    setError(null)
    setMessage(null)

    try {
      await window.api.sales.create(cart)
      setCart([])
      setSelectedId('')
      setBarcode('')
      setMessage(t('cash.validated'))
      onSaleValidated()
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Erreur.')
    }
  }

  return (
    <section className="content-grid">
      <div className="card product-form">
        <div>
          <p className="section-label">{t('cash.heading')}</p>
          <h2>{t('cash.addProduct')}</h2>
          <p className="subtitle">{t('cash.subtitle')}</p>
        </div>

        {products.length === 0 ? (
          <p className="empty-state">{t('cash.noProducts')}</p>
        ) : (
          <>
            <label>
              {t('cash.barcode')}
              <div className="inline-field">
                <input
                  value={barcode}
                  onChange={(event) => setBarcode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addByBarcode()
                    }
                  }}
                  placeholder={t('cash.barcodePlaceholder')}
                />
                <button type="button" onClick={addByBarcode}>
                  {t('cash.scanBarcode')}
                </button>
              </div>
            </label>

            <label>
              {t('cash.pickProduct')}
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                <option value="">--</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {product.price.toFixed(2)} €
                  </option>
                ))}
              </select>
            </label>

            <button type="button" onClick={addToCart} disabled={!selectedId}>
              {t('cash.addProduct')}
            </button>
          </>
        )}

        {message && <p className="info-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>

      <section className="card product-list">
        <div className="list-header">
          <div>
            <p className="section-label">{t('cash.heading')}</p>
            <h2>{t('cash.cart')}</h2>
          </div>
          <span className="cart-count">
            {cart.reduce((sum, line) => sum + line.quantity, 0)} {t('cash.items')}
          </span>
        </div>

        {cart.length === 0 ? (
          <p className="empty-state">{t('cash.cartEmpty')}</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t('catalogue.colProduct')}</th>
                  <th>{t('cash.quantity')}</th>
                  <th>{t('catalogue.colPrice')}</th>
                  <th>{t('cash.total')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((line) => (
                  <tr key={line.productId}>
                    <td>
                      <strong>{line.productName}</strong>
                    </td>
                    <td>
                      <input
                        className="qty-input"
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(event) =>
                          changeQuantity(line.productId, Number(event.target.value))
                        }
                      />
                    </td>
                    <td>{line.unitPrice.toFixed(2)} €</td>
                    <td>{(line.quantity * line.unitPrice).toFixed(2)} €</td>
                    <td>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => removeLine(line.productId)}
                      >
                        {t('cash.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="checkout-total">
          <span>{t('cash.total')}</span>
          <strong>{total.toFixed(2)} €</strong>
        </div>

        <button
          type="button"
          className="primary-wide"
          onClick={validateSale}
          disabled={cart.length === 0}
        >
          {t('cash.validate')}
        </button>
      </section>
    </section>
  )
}

export default Caisse

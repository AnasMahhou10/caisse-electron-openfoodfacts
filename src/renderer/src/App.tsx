import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language, Product, ProductPayload, Settings, Theme } from '../../shared/types'
import Catalogue from './components/Catalogue'
import Caisse from './components/Caisse'
import Historique from './components/Historique'

type Tab = 'catalogue' | 'cash' | 'history'

const dateOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
}

function App(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState<Tab>('catalogue')
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState<Settings>({ language: 'fr', theme: 'dark' })
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [salesRefreshKey, setSalesRefreshKey] = useState(0)
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let isMounted = true

    Promise.all([window.api.products.list(), window.api.settings.get()])
      .then(([productsResult, settingsResult]) => {
        if (!isMounted) {
          return
        }

        setProducts(productsResult)
        setSettings(settingsResult)
        void i18n.changeLanguage(settingsResult.language)
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [i18n])

  useEffect(() => {
    const goOnline = (): void => setIsOnline(true)
    const goOffline = (): void => setIsOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  async function reloadProducts(): Promise<void> {
    const productsResult = await window.api.products.list()
    setProducts(productsResult)
  }

  async function handleCreate(payload: ProductPayload): Promise<void> {
    await window.api.products.create(payload)
    await reloadProducts()
  }

  async function handleUpdatePrice(product: Product, price: number): Promise<void> {
    await window.api.products.update(product.id, { price })
    await reloadProducts()
  }

  async function handleDelete(product: Product): Promise<void> {
    const shouldDelete = window.confirm(t('catalogue.confirmDelete', { name: product.name }))

    if (!shouldDelete) {
      return
    }

    await window.api.products.delete(product.id)
    await reloadProducts()
  }

  async function changeSettings(next: Partial<Settings>): Promise<void> {
    const updated = await window.api.settings.update(next)
    setSettings(updated)

    if (next.language) {
      void i18n.changeLanguage(updated.language)
    }
  }

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'catalogue', icon: '🏷️', label: t('nav.catalogue') },
    { id: 'cash', icon: '🛒', label: t('nav.cash') },
    { id: 'history', icon: '🧾', label: t('nav.history') }
  ]

  const pageTitle =
    tab === 'catalogue' ? t('nav.catalogue') : tab === 'cash' ? t('nav.cash') : t('nav.history')

  return (
    <div className={`pos-app ${settings.theme}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">🛒</span>
          <div className="brand-text">
            <strong>{t('app.brand')}</strong>
            <span>{t('app.title')}</span>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`side-nav-item ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="side-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
            <span className="status-dot" />
            {isOnline ? t('app.online') : t('app.offline')}
          </span>
          <div className="settings-panel" aria-label="settings">
            <label>
              {t('settings.language')}
              <select
                value={settings.language}
                onChange={(event) => changeSettings({ language: event.target.value as Language })}
              >
                <option value="fr">FR</option>
                <option value="en">EN</option>
              </select>
            </label>
            <label>
              {t('settings.theme')}
              <select
                value={settings.theme}
                onChange={(event) => changeSettings({ theme: event.target.value as Theme })}
              >
                <option value="dark">{t('settings.dark')}</option>
                <option value="light">{t('settings.light')}</option>
              </select>
            </label>
          </div>
        </div>
      </aside>

      <div className="pos-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{t('app.brand')}</p>
            <h1 className="page-title">{pageTitle}</h1>
          </div>
          <div className="topbar-right">
            <div className="clock">
              <strong>{clock.toLocaleTimeString(settings.language)}</strong>
              <span>{clock.toLocaleDateString(settings.language, dateOptions)}</span>
            </div>
          </div>
        </header>

        <div className="pos-content">
          {tab === 'catalogue' && (
            <Catalogue
              products={products}
              isLoading={isLoading}
              onCreate={handleCreate}
              onUpdatePrice={handleUpdatePrice}
              onDelete={handleDelete}
            />
          )}
          {tab === 'cash' && (
            <Caisse
              products={products}
              onSaleValidated={() => {
                void reloadProducts()
                setSalesRefreshKey((current) => current + 1)
              }}
            />
          )}
          {tab === 'history' && <Historique refreshKey={salesRefreshKey} />}
        </div>
      </div>
    </div>
  )
}

export default App

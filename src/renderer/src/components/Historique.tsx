import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DailySummary, Sale, SaleWithLines } from '../../../shared/types'

interface HistoriqueProps {
  refreshKey: number
}

type SalesFilter = 'today' | 'all'

function Historique({ refreshKey }: HistoriqueProps): React.JSX.Element {
  const { t } = useTranslation()
  const [sales, setSales] = useState<Sale[]>([])
  const [summary, setSummary] = useState<DailySummary | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedSale, setSelectedSale] = useState<SaleWithLines | null>(null)
  const [filter, setFilter] = useState<SalesFilter>('today')

  useEffect(() => {
    let isMounted = true

    const salesPromise = filter === 'today' ? window.api.sales.listToday() : window.api.sales.list()

    Promise.all([salesPromise, window.api.sales.dailySummary()])
      .then(([salesResult, summaryResult]) => {
        if (!isMounted) {
          return
        }

        setSales(salesResult)
        setSummary(summaryResult)
      })
      .catch(() => undefined)

    return () => {
      isMounted = false
    }
  }, [filter, refreshKey])

  async function exportCsv(): Promise<void> {
    const result = await window.api.exports.csv()
    setMessage(
      result.saved ? t('history.exported', { path: result.filePath }) : t('history.exportCancelled')
    )
  }

  async function exportPdf(): Promise<void> {
    const result = await window.api.exports.pdf()
    setMessage(
      result.saved ? t('history.exported', { path: result.filePath }) : t('history.exportCancelled')
    )
  }

  async function viewTicket(saleId: string): Promise<void> {
    const detail = await window.api.sales.detail(saleId)
    setSelectedSale(detail)
  }

  return (
    <section className="history-layout">
      <div className="summary-row">
        <div className="card summary-card">
          <p className="section-label">{t('history.today')}</p>
          <h2>{summary?.total.toFixed(2) ?? '0.00'} €</h2>
          <span>{t('history.totalDay')}</span>
        </div>
        <div className="card summary-card">
          <p className="section-label">{t('history.salesCount')}</p>
          <h2>{summary?.salesCount ?? 0}</h2>
          <span>{t('history.today')}</span>
        </div>
        <div className="card summary-card actions-card">
          <button type="button" onClick={exportCsv}>
            {t('history.exportCsv')}
          </button>
          <button type="button" onClick={exportPdf}>
            {t('history.exportPdf')}
          </button>
        </div>
      </div>

      {message && <p className="info-message">{message}</p>}

      <section className="card product-list">
        <div className="list-header">
          <div>
            <p className="section-label">{t('history.heading')}</p>
            <h2>{t('history.subtitle')}</h2>
          </div>
          <div className="tabs">
            <button
              className={filter === 'today' ? 'active' : ''}
              type="button"
              onClick={() => setFilter('today')}
            >
              {t('history.filterToday')}
            </button>
            <button
              className={filter === 'all' ? 'active' : ''}
              type="button"
              onClick={() => setFilter('all')}
            >
              {t('history.filterAll')}
            </button>
          </div>
        </div>

        {sales.length === 0 ? (
          <p className="empty-state">{t('history.empty')}</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t('history.ticket')}</th>
                  <th>{t('history.date')}</th>
                  <th>{t('history.amount')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.id.slice(0, 8)}</td>
                    <td>{new Date(sale.createdAt).toLocaleString()}</td>
                    <td>{sale.total.toFixed(2)} €</td>
                    <td>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => viewTicket(sale.id)}
                      >
                        {t('history.viewTicket')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSale && (
        <section className="card product-list ticket-detail">
          <div className="list-header">
            <div>
              <p className="section-label">{t('history.ticketDetail')}</p>
              <h2>
                {selectedSale.sale.id.slice(0, 8)} — {selectedSale.sale.total.toFixed(2)} €
              </h2>
            </div>
            <button type="button" onClick={() => setSelectedSale(null)}>
              {t('history.close')}
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t('history.product')}</th>
                  <th>{t('history.quantity')}</th>
                  <th>{t('history.unitPrice')}</th>
                  <th>{t('history.lineTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.productName}</td>
                    <td>{line.quantity}</td>
                    <td>{line.unitPrice.toFixed(2)} €</td>
                    <td>{line.lineTotal.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  )
}

export default Historique

import { ipcMain, Notification } from 'electron'
import {
  createProduct,
  createSale,
  deleteProduct,
  getDailySummary,
  getSaleDetail,
  getSettings,
  listProducts,
  listSales,
  listTodaySales,
  updateProduct,
  updateSettings
} from '../repositories/database'
import { lookupProductByBarcode } from './openFoodFacts'
import { exportSalesToCsv, exportSalesToPdf } from './exports'
import type { CartLine, ProductPayload, ProductUpdatePayload, Settings } from '../shared/types'

function notify(title: string, body: string): void {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
}

export function registerIpcHandlers(): void {
  ipcMain.handle('products:list', () => listProducts())

  ipcMain.handle('products:create', (_event, payload: ProductPayload) => createProduct(payload))

  ipcMain.handle('products:update', (_event, id: string, payload: ProductUpdatePayload) =>
    updateProduct(id, payload)
  )

  ipcMain.handle('products:delete', (_event, id: string) => deleteProduct(id))

  ipcMain.handle('off:lookup', (_event, barcode: string) => lookupProductByBarcode(barcode))

  ipcMain.handle('sales:create', async (_event, cart: CartLine[]) => {
    const result = await createSale(cart)
    notify('Vente enregistree', `Total : ${result.sale.total.toFixed(2)} EUR`)
    return result
  })

  ipcMain.handle('sales:list', () => listSales())

  ipcMain.handle('sales:listToday', () => listTodaySales())

  ipcMain.handle('sales:detail', (_event, id: string) => getSaleDetail(id))

  ipcMain.handle('sales:dailySummary', () => getDailySummary())

  ipcMain.handle('exports:csv', async () => {
    const sales = await listSales()
    return exportSalesToCsv(sales)
  })

  ipcMain.handle('exports:pdf', async () => {
    const sales = await listSales()
    return exportSalesToPdf(sales)
  })

  ipcMain.handle('settings:get', () => getSettings())

  ipcMain.handle('settings:update', (_event, settings: Partial<Settings>) =>
    updateSettings(settings)
  )
}

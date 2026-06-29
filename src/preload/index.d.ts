import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  CartLine,
  DailySummary,
  ExportResult,
  OffLookupResult,
  Product,
  ProductPayload,
  ProductUpdatePayload,
  Sale,
  SaleWithLines,
  Settings
} from '../shared/types'

export interface AppAPI {
  products: {
    list: () => Promise<Product[]>
    create: (payload: ProductPayload) => Promise<Product>
    update: (id: string, payload: ProductUpdatePayload) => Promise<Product>
    delete: (id: string) => Promise<void>
  }
  off: {
    lookup: (barcode: string) => Promise<OffLookupResult>
  }
  sales: {
    create: (cart: CartLine[]) => Promise<SaleWithLines>
    list: () => Promise<Sale[]>
    listToday: () => Promise<Sale[]>
    detail: (id: string) => Promise<SaleWithLines>
    dailySummary: () => Promise<DailySummary>
  }
  exports: {
    csv: () => Promise<ExportResult>
    pdf: () => Promise<ExportResult>
  }
  settings: {
    get: () => Promise<Settings>
    update: (settings: Partial<Settings>) => Promise<Settings>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: AppAPI
  }
}

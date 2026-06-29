export type ProductSource = 'off' | 'manual'

export interface Product {
  id: string
  barcode?: string
  name: string
  brand?: string
  price: number
  imageUrl?: string
  source: ProductSource
  createdAt: string
  updatedAt: string
}

export type ProductPayload = {
  barcode?: string
  name: string
  brand?: string
  price: number
  imageUrl?: string
  source?: ProductSource
}

export type ProductUpdatePayload = Partial<ProductPayload>

export interface Sale {
  id: string
  total: number
  createdAt: string
}

export interface SaleLine {
  id: string
  saleId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type Language = 'fr' | 'en'
export type Theme = 'light' | 'dark'

export interface Settings {
  language: Language
  theme: Theme
}

export interface DatabaseSchema {
  products: Product[]
  sales: Sale[]
  saleLines: SaleLine[]
  settings: Settings
}

export interface CartLine {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface SaleWithLines {
  sale: Sale
  lines: SaleLine[]
}

export interface DailySummary {
  date: string
  salesCount: number
  total: number
}

export type OffLookupStatus = 'found' | 'not_found' | 'offline' | 'error'

export interface OffProduct {
  barcode: string
  name: string
  brand?: string
  imageUrl?: string
}

export interface OffLookupResult {
  status: OffLookupStatus
  product?: OffProduct
  message?: string
}

export type ExportFormat = 'csv' | 'pdf'

export interface ExportResult {
  saved: boolean
  filePath?: string
}

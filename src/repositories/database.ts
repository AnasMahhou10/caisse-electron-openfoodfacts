import { mkdir } from 'fs/promises'
import { dirname, join } from 'path'
import { app } from 'electron'
import { JSONFilePreset } from 'lowdb/node'
import type {
  CartLine,
  DailySummary,
  DatabaseSchema,
  Product,
  ProductPayload,
  ProductUpdatePayload,
  Sale,
  SaleLine,
  SaleWithLines,
  Settings
} from '../shared/types'
import { buildSale } from '../services/saleService'
import { filterSalesByDay } from '../services/salesUtils'

const defaultData: DatabaseSchema = {
  products: [],
  sales: [],
  saleLines: [],
  settings: {
    language: 'fr',
    theme: 'dark'
  }
}

type Database = Awaited<ReturnType<typeof JSONFilePreset<DatabaseSchema>>>

let dbPromise: Promise<Database> | null = null

async function getDatabase(): Promise<Database> {
  if (!dbPromise) {
    const filePath = join(app.getPath('userData'), 'db.json')
    await mkdir(dirname(filePath), { recursive: true })
    dbPromise = JSONFilePreset<DatabaseSchema>(filePath, defaultData)
  }

  return dbPromise
}

function normalizeText(value?: string): string | undefined {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function validateProductPayload(payload: ProductPayload): ProductPayload {
  const name = normalizeText(payload.name)

  if (!name) {
    throw new Error('Le nom du produit est obligatoire.')
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    throw new Error('Le prix doit etre un nombre positif.')
  }

  return {
    barcode: normalizeText(payload.barcode),
    name,
    brand: normalizeText(payload.brand),
    price: Number(payload.price),
    imageUrl: normalizeText(payload.imageUrl),
    source: payload.source ?? 'manual'
  }
}

export async function listProducts(): Promise<Product[]> {
  const db = await getDatabase()
  await db.read()

  return [...db.data.products].sort((a, b) => a.name.localeCompare(b.name))
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const db = await getDatabase()
  await db.read()

  const productData = validateProductPayload(payload)
  const now = new Date().toISOString()
  const product: Product = {
    id: crypto.randomUUID(),
    barcode: productData.barcode,
    name: productData.name,
    brand: productData.brand,
    price: productData.price,
    imageUrl: productData.imageUrl,
    source: productData.source ?? 'manual',
    createdAt: now,
    updatedAt: now
  }

  db.data.products.push(product)
  await db.write()

  return product
}

export async function updateProduct(id: string, payload: ProductUpdatePayload): Promise<Product> {
  const db = await getDatabase()
  await db.read()

  const product = db.data.products.find((item) => item.id === id)

  if (!product) {
    throw new Error('Produit introuvable.')
  }

  const updated = validateProductPayload({
    barcode: payload.barcode ?? product.barcode,
    name: payload.name ?? product.name,
    brand: payload.brand ?? product.brand,
    price: payload.price ?? product.price,
    imageUrl: payload.imageUrl ?? product.imageUrl,
    source: payload.source ?? product.source
  })

  product.barcode = updated.barcode
  product.name = updated.name
  product.brand = updated.brand
  product.price = updated.price
  product.imageUrl = updated.imageUrl
  product.source = updated.source ?? 'manual'
  product.updatedAt = new Date().toISOString()

  await db.write()

  return product
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDatabase()
  await db.read()

  db.data.products = db.data.products.filter((product) => product.id !== id)
  await db.write()
}

export async function createSale(cart: CartLine[]): Promise<SaleWithLines> {
  const db = await getDatabase()
  await db.read()

  const built = buildSale(cart)
  const now = new Date().toISOString()
  const sale: Sale = {
    id: crypto.randomUUID(),
    total: built.total,
    createdAt: now
  }

  const lines: SaleLine[] = built.lines.map((line) => ({
    id: crypto.randomUUID(),
    saleId: sale.id,
    productId: line.productId,
    productName: line.productName,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    lineTotal: line.lineTotal
  }))

  db.data.sales.push(sale)
  db.data.saleLines.push(...lines)
  await db.write()

  return { sale, lines }
}

export async function listSales(): Promise<Sale[]> {
  const db = await getDatabase()
  await db.read()

  return [...db.data.sales].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function listTodaySales(date = new Date()): Promise<Sale[]> {
  const db = await getDatabase()
  await db.read()

  return filterSalesByDay(db.data.sales, date).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getSaleDetail(id: string): Promise<SaleWithLines> {
  const db = await getDatabase()
  await db.read()

  const sale = db.data.sales.find((item) => item.id === id)

  if (!sale) {
    throw new Error('Vente introuvable.')
  }

  const lines = db.data.saleLines.filter((line) => line.saleId === id)

  return { sale, lines }
}

export async function getDailySummary(date = new Date()): Promise<DailySummary> {
  const db = await getDatabase()
  await db.read()

  const day = date.toISOString().slice(0, 10)
  const sales = filterSalesByDay(db.data.sales, date)

  return {
    date: day,
    salesCount: sales.length,
    total: Number(sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2))
  }
}

export async function getSettings(): Promise<Settings> {
  const db = await getDatabase()
  await db.read()

  return db.data.settings
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const db = await getDatabase()
  await db.read()

  db.data.settings = {
    ...db.data.settings,
    ...settings
  }

  await db.write()

  return db.data.settings
}

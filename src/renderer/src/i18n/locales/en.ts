import type { TranslationSchema } from './fr'

export const en: TranslationSchema = {
  app: {
    brand: 'Corner Grocery',
    title: 'Point of sale',
    offline: 'Offline',
    online: 'Online'
  },
  nav: {
    catalogue: 'Catalogue',
    cash: 'Checkout',
    history: 'History'
  },
  settings: {
    language: 'Language',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light'
  },
  catalogue: {
    heading: 'Product catalogue',
    subtitle: 'Add products, set prices and keep a local catalogue usable offline.',
    count_one: '{{count}} product',
    count_other: '{{count}} products',
    search: 'Search a product...',
    empty: 'No product yet. Add your first product with the form.',
    loading: 'Loading catalogue...',
    colProduct: 'Product',
    colBarcode: 'Barcode',
    colSource: 'Source',
    colPrice: 'Price',
    sourceOff: 'OpenFoodFacts',
    sourceManual: 'Manual',
    delete: 'Delete',
    editPrice: 'Edit',
    savePrice: 'Save',
    confirmDelete: 'Remove {{name}} from the catalogue?'
  },
  form: {
    newProduct: 'New product',
    manualEntry: 'Manual entry',
    barcode: 'Barcode',
    lookup: 'Search (OpenFoodFacts)',
    searching: 'Searching...',
    name: 'Product name',
    brand: 'Brand',
    brandPlaceholder: 'Optional',
    price: 'Price',
    add: 'Add to catalogue',
    preview: 'Product preview',
    found: 'Product found: fields pre-filled.',
    notFound: 'Unknown product: enter the details manually.',
    offline: 'No connection: manual entry.'
  },
  cash: {
    heading: 'Checkout',
    subtitle: 'Build the bill, adjust quantities and validate the sale.',
    addProduct: 'Add a product',
    pickProduct: 'Pick a product',
    barcode: 'Scan a barcode',
    barcodePlaceholder: 'Type or scan a barcode',
    scanBarcode: 'Add to cart',
    productNotFound: 'Product not found in the local catalogue.',
    noProducts: 'No product in the catalogue. Add products first.',
    cartEmpty: 'The cart is empty.',
    cart: 'Cart',
    items: 'items',
    quantity: 'Qty',
    total: 'Total due',
    validate: 'Validate sale',
    validated: 'Sale validated!',
    remove: 'Remove'
  },
  history: {
    heading: 'Sales history',
    subtitle: "Review today's sales and every ticket.",
    today: 'Today',
    salesCount: 'Tickets',
    totalDay: 'Daily total',
    exportCsv: 'Export CSV',
    exportPdf: 'Export PDF',
    empty: 'No sale recorded yet.',
    ticket: 'Ticket',
    date: 'Date',
    amount: 'Amount',
    exported: 'Export done: {{path}}',
    exportCancelled: 'Export cancelled.',
    viewTicket: 'View',
    filterToday: 'Today',
    filterAll: 'All',
    ticketDetail: 'Ticket details',
    product: 'Product',
    quantity: 'Quantity',
    unitPrice: 'Unit price',
    lineTotal: 'Line total',
    close: 'Close'
  }
}

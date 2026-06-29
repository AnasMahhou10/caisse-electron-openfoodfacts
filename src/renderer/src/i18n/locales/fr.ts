export const fr = {
  app: {
    brand: 'Épicerie du Quartier',
    title: 'Logiciel de caisse',
    offline: 'Hors-ligne',
    online: 'En ligne'
  },
  nav: {
    catalogue: 'Catalogue',
    cash: 'Caisse',
    history: 'Historique'
  },
  settings: {
    language: 'Langue',
    theme: 'Theme',
    dark: 'Sombre',
    light: 'Clair'
  },
  catalogue: {
    heading: 'Catalogue produits',
    subtitle:
      'Ajoute les produits, fixe les prix et garde un catalogue local utilisable hors-ligne.',
    count_one: '{{count}} produit',
    count_other: '{{count}} produits',
    search: 'Rechercher un produit...',
    empty: 'Aucun produit. Ajoute ton premier produit avec le formulaire.',
    loading: 'Chargement du catalogue...',
    colProduct: 'Produit',
    colBarcode: 'Code-barres',
    colSource: 'Source',
    colPrice: 'Prix',
    sourceOff: 'OpenFoodFacts',
    sourceManual: 'Manuel',
    delete: 'Supprimer',
    editPrice: 'Modifier',
    savePrice: 'Enregistrer',
    confirmDelete: 'Supprimer {{name}} du catalogue ?'
  },
  form: {
    newProduct: 'Nouveau produit',
    manualEntry: 'Ajout manuel',
    barcode: 'Code-barres',
    lookup: 'Rechercher (OpenFoodFacts)',
    searching: 'Recherche...',
    name: 'Nom du produit',
    brand: 'Marque',
    brandPlaceholder: 'Optionnel',
    price: 'Prix TTC',
    add: 'Ajouter au catalogue',
    preview: 'Apercu du produit',
    found: 'Produit trouve : informations pre-remplies.',
    notFound: 'Produit inconnu : saisis les informations a la main.',
    offline: 'Pas de connexion : saisie manuelle.'
  },
  cash: {
    heading: 'Encaisser',
    subtitle: 'Compose la note, ajuste les quantites et valide la vente.',
    addProduct: 'Ajouter un produit',
    pickProduct: 'Choisir un produit',
    barcode: 'Scanner un code-barres',
    barcodePlaceholder: 'Tape ou scanne un code-barres',
    scanBarcode: 'Ajouter au panier',
    productNotFound: 'Produit introuvable dans le catalogue local.',
    noProducts: "Aucun produit dans le catalogue. Ajoute des produits d'abord.",
    cartEmpty: 'Le panier est vide.',
    cart: 'Panier',
    items: 'articles',
    quantity: 'Qte',
    total: 'Total à payer',
    validate: 'Valider la vente',
    validated: 'Vente validee !',
    remove: 'Retirer'
  },
  history: {
    heading: 'Historique des ventes',
    subtitle: 'Consulte les ventes du jour et tous les tickets.',
    today: "Aujourd'hui",
    salesCount: 'Tickets',
    totalDay: 'Total du jour',
    exportCsv: 'Exporter CSV',
    exportPdf: 'Exporter PDF',
    empty: 'Aucune vente enregistree.',
    ticket: 'Ticket',
    date: 'Date',
    amount: 'Montant',
    exported: 'Export reussi : {{path}}',
    exportCancelled: 'Export annule.',
    viewTicket: 'Voir',
    filterToday: "Aujourd'hui",
    filterAll: 'Toutes',
    ticketDetail: 'Detail du ticket',
    product: 'Produit',
    quantity: 'Quantite',
    unitPrice: 'Prix unitaire',
    lineTotal: 'Total ligne',
    close: 'Fermer'
  }
}

export type TranslationSchema = typeof fr

import { writeFile } from 'fs/promises'
import { dialog } from 'electron'
import { jsPDF } from 'jspdf'
import type { ExportResult, Sale } from '../shared/types'
import { computeSalesTotal, salesToCsv } from '../services/exportService'

function defaultFileName(extension: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `ventes-${date}.${extension}`
}

export async function exportSalesToCsv(sales: Sale[]): Promise<ExportResult> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Exporter les ventes (CSV)',
    defaultPath: defaultFileName('csv'),
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  })

  if (canceled || !filePath) {
    return { saved: false }
  }

  const csv = salesToCsv(sales)
  await writeFile(filePath, `\uFEFF${csv}`, 'utf-8')

  return { saved: true, filePath }
}

export async function exportSalesToPdf(sales: Sale[]): Promise<ExportResult> {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Exporter les ventes (PDF)',
    defaultPath: defaultFileName('pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })

  if (canceled || !filePath) {
    return { saved: false }
  }

  const doc = new jsPDF()
  const generatedAt = new Date().toLocaleString('fr-FR')

  doc.setFontSize(18)
  doc.text('Rapport des ventes', 14, 20)
  doc.setFontSize(10)
  doc.text(`Genere le ${generatedAt}`, 14, 27)
  doc.text(`Nombre de tickets : ${sales.length}`, 14, 33)
  doc.text(`Total : ${computeSalesTotal(sales).toFixed(2)} EUR`, 14, 39)

  doc.setFontSize(11)
  doc.text('Ticket', 14, 52)
  doc.text('Date', 80, 52)
  doc.text('Total', 170, 52, { align: 'right' })
  doc.line(14, 54, 196, 54)

  let y = 61
  doc.setFontSize(9)

  for (const sale of sales) {
    if (y > 280) {
      doc.addPage()
      y = 20
    }

    doc.text(sale.id.slice(0, 8), 14, y)
    doc.text(new Date(sale.createdAt).toLocaleString('fr-FR'), 80, y)
    doc.text(`${sale.total.toFixed(2)} EUR`, 196, y, { align: 'right' })
    y += 7
  }

  const arrayBuffer = doc.output('arraybuffer')
  await writeFile(filePath, Buffer.from(arrayBuffer))

  return { saved: true, filePath }
}

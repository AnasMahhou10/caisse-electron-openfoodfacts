import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { CartLine, ProductPayload, ProductUpdatePayload, Settings } from '../shared/types'

// API metier exposee au renderer. Le renderer n'accede jamais directement
// a Node ou au systeme : tout passe par ces canaux IPC controles.
const api = {
  products: {
    list: () => ipcRenderer.invoke('products:list'),
    create: (payload: ProductPayload) => ipcRenderer.invoke('products:create', payload),
    update: (id: string, payload: ProductUpdatePayload) =>
      ipcRenderer.invoke('products:update', id, payload),
    delete: (id: string) => ipcRenderer.invoke('products:delete', id)
  },
  off: {
    lookup: (barcode: string) => ipcRenderer.invoke('off:lookup', barcode)
  },
  sales: {
    create: (cart: CartLine[]) => ipcRenderer.invoke('sales:create', cart),
    list: () => ipcRenderer.invoke('sales:list'),
    listToday: () => ipcRenderer.invoke('sales:listToday'),
    detail: (id: string) => ipcRenderer.invoke('sales:detail', id),
    dailySummary: () => ipcRenderer.invoke('sales:dailySummary')
  },
  exports: {
    csv: () => ipcRenderer.invoke('exports:csv'),
    pdf: () => ipcRenderer.invoke('exports:pdf')
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings: Partial<Settings>) => ipcRenderer.invoke('settings:update', settings)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

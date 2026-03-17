/**
 * Save Data — Export/Import quotation settings as JSON
 * Supports both Electron (native dialog) and browser (download/file-picker) modes
 */

const SAVE_VERSION = 1
const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron

/**
 * Build the save data object from state
 */
function buildSaveData(state) {
  return {
    version: SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    settings: {
      companyName: state.companyName,
      companyAddress: state.companyAddress,
      logoSrc: state.logoSrc,
      clientName: state.clientName,
      clientAddress: state.clientAddress,
      quoteNumber: state.quoteNumber,
      quoteDate: state.quoteDate,
      taxRate: state.taxRate,
      currency: state.currency,
      items: state.items.map(item => ({
        id: item.id,
        title: item.title,
        desc: item.desc,
        qty: item.qty,
        price: item.price,
      })),
    },
  }
}

/**
 * Export quotation state to a JSON file
 * Uses Electron native dialog if available, otherwise browser download
 * @param {Object} state - The quotation store state
 * @returns {Promise<{canceled: boolean}>}
 */
export async function exportSettings(state) {
  const data = buildSaveData(state)
  const json = JSON.stringify(data, null, 2)
  const defaultFilename = `Quotation_${state.quoteNumber || 'draft'}_${new Date().toISOString().slice(0, 10)}.json`

  if (isElectron) {
    // Electron: native save dialog
    const result = await window.electronAPI.saveJSON({
      defaultFilename,
      jsonContent: json,
    })
    return result
  } else {
    // Browser: trigger download
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return { canceled: false }
  }
}

/**
 * Import quotation settings from a JSON file
 * Uses Electron native dialog if available, otherwise expects a File object
 * @param {File|null} file - The JSON file (browser mode) or null (Electron mode)
 * @returns {Promise<Object>} The parsed settings
 */
export async function importSettings(file) {
  let jsonText

  if (isElectron && !file) {
    // Electron: native open dialog
    const result = await window.electronAPI.openJSON()
    if (result.canceled) {
      return null // Signal that user cancelled
    }
    jsonText = result.content
  } else if (file) {
    // Browser: read from File object
    jsonText = await new Promise((resolve, reject) => {
      if (!file.name.endsWith('.json')) {
        reject(new Error('Please select a valid .json file'))
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  } else {
    throw new Error('No file provided')
  }

  // Parse and validate
  const data = JSON.parse(jsonText)

  if (!data.settings) {
    throw new Error('Invalid save file: missing settings')
  }

  const s = data.settings
  if (typeof s.companyName === 'undefined' && typeof s.items === 'undefined') {
    throw new Error('Invalid save file: unrecognized format')
  }

  return s
}

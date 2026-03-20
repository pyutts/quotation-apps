<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0">
    <div v-if="store.showExportModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/50" @click="close"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-3xl shadow-2xl w-[480px] overflow-hidden fade-in flex flex-col">
        <!-- Header -->
        <div class="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <FileDown class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-extrabold text-xl text-gray-900 tracking-tight">Export PDF</h3>
              <p class="text-gray-500 text-sm font-medium mt-0.5">Choose filename and save location</p>
            </div>
          </div>
          <button @click="close" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 space-y-6">
          <!-- Filename -->
          <div>
            <label class="block text-sm font-bold text-gray-900 mb-2">Filename</label>
            <div class="relative group">
              <input
                ref="filenameInput"
                v-model="filename"
                @keydown.enter="generate"
                class="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-14 bg-white focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-sm font-semibold text-gray-800"
                placeholder="Enter filename">
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">.pdf</span>
            </div>
          </div>

          <!-- Save method info -->
          <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-start gap-3.5">
            <div class="p-1 rounded-full bg-blue-100 shrink-0">
              <Info class="w-4 h-4 text-blue-600" />
            </div>
            <p class="text-sm text-gray-600 leading-relaxed font-medium">
              Click <span class="text-gray-900 font-bold">Generate & Save As</span> to choose where to save the file on your device.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 pb-8 flex gap-3">
          <button @click="close"
                  class="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-bold transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button @click="generate"
                  :disabled="!filename.trim() || generating"
                  class="flex-1 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Loader2 v-if="generating" class="w-5 h-5 animate-spin" />
            <Download v-else class="w-5 h-5" />
            {{ generating ? 'Generating...' : 'Generate & Save As' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { FileDown, Download, Info, Loader2, X } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'
import { generatePDFBlob } from '../utils/pdfGenerator'

const store = useQuotationStore()
const filenameInput = ref(null)
const generating = ref(false)
const filename = ref('')

const isElectron = !!window.electronAPI?.isElectron

// Auto-focus and set default filename when modal opens
watch(() => store.showExportModal, async (val) => {
  if (val) {
    filename.value = `Quote_${store.quoteNumber || '0001'}`
    await nextTick()
    filenameInput.value?.focus()
    filenameInput.value?.select()
  }
})

function close() {
  if (!generating.value) {
    store.showExportModal = false
  }
}

async function generate() {
  if (!filename.value.trim() || generating.value) return

  generating.value = true
  const fullFilename = `${filename.value.trim()}.pdf`

  try {
    const pdfBlob = await generatePDFBlob()

    if (isElectron) {
      // ── Electron: use native save dialog via IPC ──
      const arrayBuffer = await pdfBlob.arrayBuffer()
      const result = await window.electronAPI.savePDF({
        defaultFilename: fullFilename,
        pdfBuffer: Array.from(new Uint8Array(arrayBuffer)),
      })
      if (result.canceled) {
        generating.value = false
        return
      }
      store.showToast(`PDF saved to ${result.filePath}`)
    } else if (typeof window.showSaveFilePicker === 'function') {
      // ── Browser: File System Access API ──
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fullFilename,
          types: [{
            description: 'PDF Document',
            accept: { 'application/pdf': ['.pdf'] },
          }],
        })
        const writable = await handle.createWritable()
        await writable.write(pdfBlob)
        await writable.close()
        store.showToast('PDF saved successfully!')
      } catch (err) {
        if (err.name === 'AbortError') {
          generating.value = false
          return
        }
        throw err
      }
    } else {
      // ── Fallback: regular download ──
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = fullFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      store.showToast('PDF downloaded successfully!')
    }

    store.showExportModal = false
  } catch (err) {
    console.error('PDF generation failed:', err)
    store.showToast('Failed to generate PDF', true)
  } finally {
    generating.value = false
  }
}
</script>

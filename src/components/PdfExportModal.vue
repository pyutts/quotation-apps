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
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-[440px] overflow-hidden fade-in">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5 text-white">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileDown class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-lg">Export PDF</h3>
              <p class="text-white/70 text-sm">Choose filename and save location</p>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">
          <!-- Filename -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Filename</label>
            <div class="relative">
              <input
                ref="filenameInput"
                v-model="filename"
                @keydown.enter="generate"
                class="w-full border border-gray-200 rounded-xl px-4 py-3 pr-14 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none text-sm font-medium"
                placeholder="Enter filename">
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">.pdf</span>
            </div>
          </div>

          <!-- Save method info -->
          <div class="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-start gap-3">
            <Info class="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
            <p class="text-sm text-primary-700 leading-relaxed">
              Click <strong>"Generate & Save As"</strong> to choose where to save the file on your device.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6 flex gap-3">
          <button @click="close"
                  class="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button @click="generate"
                  :disabled="!filename.trim() || generating"
                  class="flex-1 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Loader2 v-if="generating" class="w-4 h-4 animate-spin" />
            <Download v-else class="w-4 h-4" />
            {{ generating ? 'Generating...' : 'Generate & Save As' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { FileDown, Download, Info, Loader2 } from 'lucide-vue-next'
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

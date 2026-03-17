<template>
  <header class="glass-panel border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 relative shadow-sm shrink-0">
    <div class="flex items-center gap-3">
      <img src="/favicon.png" alt="Logo" class="w-10 h-10 rounded-xl shadow-lg shadow-primary-500/20">
      <h1 class="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
        Quotation Maping Web
      </h1>
    </div>

    <div class="flex gap-3 items-center">
      <!-- Currency Selector -->
      <div class="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-1.5 shadow-sm">
        <DollarSign class="w-4 h-4 text-gray-400" />
        <select v-model="store.currency" class="bg-transparent border-none text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1">
          <option value="IDR">IDR (Rp)</option>
          <option value="USD">USD ($)</option>
          <option value="AUD">AUD (A$)</option>
        </select>
      </div>

      <!-- Save Button -->
      <button @click="store.exportToJson()"
              class="flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2.5 rounded-full font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-sm">
        <Save class="w-4 h-4" />
        Save
      </button>

      <!-- Load Button (Electron: native dialog, Browser: file input) -->
      <button v-if="isElectron"
              @click="store.importFromJson()"
              class="flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2.5 rounded-full font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer">
        <FolderOpen class="w-4 h-4" />
        Load
      </button>
      <label v-else
             class="flex items-center gap-2 bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2.5 rounded-full font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer">
        <FolderOpen class="w-4 h-4" />
        Load
        <input type="file" accept=".json" @change="handleImport" class="hidden">
      </label>

      <!-- Download PDF Button -->
      <button @click="store.downloadPDF()"
              :disabled="store.pdfGenerating"
              class="bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-medium shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
        <template v-if="!store.pdfGenerating">
          <Download class="w-4 h-4" />
          Download PDF
        </template>
        <template v-else>
          <Loader2 class="w-4 h-4 animate-spin" />
          Generating...
        </template>
      </button>
    </div>
  </header>
</template>

<script setup>
import { Save, FolderOpen, Download, Loader2, DollarSign } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'

const store = useQuotationStore()
const isElectron = !!window.electronAPI?.isElectron

function handleImport(event) {
  const file = event.target.files[0]
  if (file) {
    store.importFromJson(file)
  }
  event.target.value = ''
}
</script>


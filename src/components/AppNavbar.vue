<template>
  <header
    class="glass-panel border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 relative shadow-sm shrink-0">
    <div class="flex items-center gap-3">
      <img src="/favicon.png" alt="Logo" class="w-10 h-10 rounded-xl shadow-lg shadow-primary-500/20">
      <h1
        class="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
        Quotation MapingWeb
      </h1>
    </div>

    <div class="flex gap-3 items-center">
      <!-- Currency Selector -->
      <div class="flex items-center gap-2 bg-gray-50/80 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors">
        <DollarSign class="w-4 h-4 text-gray-500" />
        <select v-model="store.currency"
          class="bg-transparent border-none text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1">
          <option value="IDR">IDR (Rp)</option>
          <option value="USD">USD ($)</option>
          <option value="AUD">AUD (A$)</option>
        </select>
      </div>

      <!-- Language Selector -->
      <div class="flex items-center gap-2 bg-gray-50/80 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors">
        <Globe class="w-4 h-4 text-gray-500" />
        <select v-model="store.language"
          class="bg-transparent border-none text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer pr-1">
          <option value="en">English</option>
          <option value="id">Indonesia</option>
        </select>
      </div>

      <!-- Signature Toggle -->
      <button @click="store.showSignature = !store.showSignature"
        :title="store.showSignature ? 'Hide Signature' : 'Show Signature'" :class="store.showSignature
          ? 'bg-primary-50 text-primary-600'
          : 'bg-gray-50/80 text-gray-500 hover:bg-gray-100'"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold transition-colors text-sm">
        <PenTool class="w-4 h-4" />
        <span class="text-xs">{{ store.showSignature ? 'TTD' : 'No TTD' }}</span>
      </button>

      <!-- Save Button -->
      <button @click="store.exportToJson()"
        class="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-full font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all active:scale-95 text-sm">
        <Save class="w-4 h-4 text-gray-500" />
        Save
      </button>

      <!-- Load Button (Electron: native dialog, Browser: file input) -->
      <button v-if="isElectron" @click="store.importFromJson()"
        class="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-full font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all active:scale-95 text-sm cursor-pointer">
        <FolderOpen class="w-4 h-4 text-gray-500" />
        Load
      </button>
      <label v-else
        class="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-full font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all active:scale-95 text-sm cursor-pointer">
        <FolderOpen class="w-4 h-4 text-gray-500" />
        Load
        <input type="file" accept=".json" @change="handleImport" class="hidden">
      </label>

      <!-- Download PDF Button -->
      <button @click="store.downloadPDF()" :disabled="store.pdfGenerating"
        class="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-5 py-2 rounded-full font-semibold shadow-md shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-2 text-sm ml-1">
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
import { Save, FolderOpen, Download, Loader2, DollarSign, Globe, PenTool } from 'lucide-vue-next'
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

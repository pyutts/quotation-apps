<template>
  <header
    class="glass-panel border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 relative shadow-sm shrink-0">
    <div class="flex items-center gap-3">
      <img :src="isElectron ? './favicon.png' : '/favicon.png'" alt="Logo" class="w-10 h-10 rounded-xl shadow-lg shadow-primary-500/20">
      <h1
        class="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
        Quotation MapingWeb
      </h1>
    </div>

    <div class="flex gap-3 items-center">
      <!-- Help Button -->
      <button @click="store.showShortcutsModal = true"
        class="flex items-center justify-center w-[38px] h-[38px] bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all active:scale-95 cursor-pointer mr-1" title="Keyboard Shortcuts">
        <Keyboard class="w-4 h-4 text-gray-500" />
      </button>

      <!-- Background overlay to catch outside clicks -->
      <div v-if="currencyOpen || languageOpen" class="fixed inset-0 z-40" @click="currencyOpen = false; languageOpen = false"></div>

      <!-- Currency Selector Custom Dropdown -->
      <div class="relative z-50">
        <button @click="currencyOpen = !currencyOpen; languageOpen = false"
          class="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-full px-3 py-1.5 transition-all active:scale-95 focus:outline-none">
          <DollarSign class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-semibold text-gray-700 select-none min-w-[3.5rem] text-left">
            {{ currencies.find(c => c.value === store.currency)?.label }}
          </span>
          <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
        </button>
        
        <Transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
          <div v-show="currencyOpen" class="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 focus:outline-none">
            <button v-for="curr in currencies" :key="curr.value" @click="store.currency = curr.value; currencyOpen = false" 
              class="w-full text-left px-4 py-2 text-sm font-semibold flex items-center justify-between transition-colors"
              :class="store.currency === curr.value ? 'text-primary-600 bg-primary-50/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'">
              {{ curr.label }}
              <Check v-if="store.currency === curr.value" class="w-4 h-4 text-primary-600" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Language Selector Custom Dropdown -->
      <div class="relative z-50">
        <button @click="languageOpen = !languageOpen; currencyOpen = false"
          class="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-full px-3 py-1.5 transition-all active:scale-95 focus:outline-none">
          <Globe class="w-4 h-4 text-gray-500" />
          <span class="text-sm font-semibold text-gray-700 select-none min-w-[3.5rem] text-left">
            {{ languages.find(l => l.value === store.language)?.label }}
          </span>
          <ChevronDown class="w-3.5 h-3.5 text-gray-400" />
        </button>

        <Transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
          <div v-show="languageOpen" class="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 focus:outline-none">
            <button v-for="lang in languages" :key="lang.value" @click="store.language = lang.value; languageOpen = false" 
              class="w-full text-left px-4 py-2 text-sm font-semibold flex items-center justify-between transition-colors"
              :class="store.language === lang.value ? 'text-primary-600 bg-primary-50/50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'">
              {{ lang.label }}
              <Check v-if="store.language === lang.value" class="w-4 h-4 text-primary-600" />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Signature Toggle -->
      <button @click="store.showSignature = !store.showSignature"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all active:scale-95 border shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
        :class="store.showSignature ? 'bg-primary-50 text-primary-700 border-primary-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'">
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
        <input type="file" accept=".json" @change="handleImport" class="hidden" id="json-upload-input">
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
import { ref } from 'vue'
import { Save, FolderOpen, Download, Loader2, DollarSign, Globe, PenTool, Keyboard, ChevronDown, Check } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'

const store = useQuotationStore()
const isElectron = !!window.electronAPI?.isElectron

const currencyOpen = ref(false)
const languageOpen = ref(false)

const currencies = [
  { value: 'IDR', label: 'IDR (Rp)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'AUD', label: 'AUD (A$)' }
]

const languages = [
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesia' }
]

function handleImport(event) {
  const file = event.target.files[0]
  if (file) {
    store.importFromJson(file)
  }
  event.target.value = ''
}
</script>

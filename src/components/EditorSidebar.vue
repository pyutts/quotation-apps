<template>
  <aside
    class="w-[450px] shrink-0 glass-panel border-r border-gray-200 overflow-y-auto no-scrollbar flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
    <div class="p-8 space-y-10">

      <!-- Section: Company -->
      <div class="space-y-5">
        <div class="flex items-center gap-2 text-primary-600 mb-2">
          <div class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Building2 class="w-[18px] h-[18px]" />
          </div>
          <h2 class="font-bold text-gray-900 text-lg">Your Details</h2>
        </div>

        <div class="fade-in" style="animation-delay: 0.1s">
          <label class="label-text">Company Address</label>
          <textarea v-model="store.companyAddress" class="input-field resize-none h-24"
            placeholder="Your full business address"></textarea>
        </div>
      </div>

      <hr class="border-gray-100">

      <!-- Section: Client -->
      <div class="space-y-5">
        <div class="flex items-center gap-2 text-primary-600 mb-2">
          <div class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <User class="w-[18px] h-[18px]" />
          </div>
          <h2 class="font-bold text-gray-900 text-lg">Client Details</h2>
        </div>

        <div class="fade-in" style="animation-delay: 0.25s">
          <label class="label-text">Client Name</label>
          <input v-model="store.clientName" class="input-field" placeholder="e.g. John Doe">
        </div>

        <div class="fade-in" style="animation-delay: 0.3s">
          <label class="label-text">Client Address</label>
          <textarea v-model="store.clientAddress" class="input-field resize-none h-24"
            placeholder="Client's billing address"></textarea>
        </div>
      </div>

      <hr class="border-gray-100">

      <!-- Section: Document Info -->
      <div class="space-y-5">
        <div class="flex items-center gap-2 text-primary-600 mb-2">
          <div class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Info class="w-[18px] h-[18px]" />
          </div>
          <h2 class="font-bold text-gray-900 text-lg">Doc Information</h2>
        </div>

        <div class="grid grid-cols-2 gap-4 fade-in" style="animation-delay: 0.35s">
          <div>
            <label class="label-text">Quote No.</label>
            <div class="flex gap-2">
              <input v-model="store.quoteNumber" class="input-field flex-1" placeholder="e.g. MW-2026-A1B2">
              <button @click="store.generateQuoteNumber()" title="Generate Quote Number"
                class="shrink-0 w-11 h-11 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white flex items-center justify-center transition-all active:scale-95 border border-primary-200 hover:border-primary-600">
                <RefreshCw class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label class="label-text">Date</label>
            <input type="date" v-model="store.quoteDate" class="input-field font-medium text-gray-600">
          </div>
        </div>

        <div class="fade-in space-y-3" style="animation-delay: 0.4s">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative flex items-center">
              <input type="checkbox" v-model="store.enableTax" class="sr-only peer">
              <div class="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </div>
            <span class="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">Apply Tax</span>
          </label>
          
          <div v-if="store.enableTax" class="relative mt-2">
            <label class="label-text mb-1">Tax Rate (%)</label>
            <div class="relative">
              <input v-model.number="store.taxRate" type="number" min="0" step="0.1" class="input-field pl-10">
              <Percent class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <hr class="border-gray-100">

      <!-- Section: Items Control -->
      <div class="space-y-5 pb-8">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2 text-primary-600">
            <div class="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <ListChecks class="w-[18px] h-[18px]" />
            </div>
            <h2 class="font-bold text-gray-900 text-lg">Items & Details</h2>
          </div>
          <button @click="store.addItem()"
            class="text-sm font-semibold text-primary-600 hover:text-white hover:bg-primary-600 bg-primary-50 px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95">
            <Plus class="w-4 h-4" />
            Add Item
          </button>
        </div>

        <div class="space-y-4">
          <ItemCard v-for="(item, index) in store.items" :key="item.id" :item="item" :index="index"
            :can-remove="store.items.length > 1" @remove="store.removeItem" />
        </div>
      </div>

    </div>
  </aside>
</template>

<script setup>
import { Building2, User, Info, ListChecks, Plus, Percent, RefreshCw } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'
import ItemCard from './ItemCard.vue'

const store = useQuotationStore()
</script>

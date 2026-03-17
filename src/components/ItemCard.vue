<template>
  <div class="bg-white border border-gray-100 hover:border-primary-200 transition-colors rounded-2xl p-5 shadow-sm relative group fade-in" style="animation-duration: 0.2s">
    <!-- Item number badge -->
    <div class="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white z-10 transition-transform group-hover:scale-110 group-hover:bg-primary-600">
      {{ index + 1 }}
    </div>

    <!-- Remove button (only show if there are multiple items) -->
    <button v-if="canRemove"
            @click="$emit('remove', item.id)"
            class="absolute -top-3 -right-3 bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600 hover:text-white z-10 hover:scale-110 active:scale-95 border-2 border-white">
      <Trash2 class="w-3.5 h-3.5" />
    </button>

    <div class="space-y-4 mt-1">
      <div>
        <label class="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1 block">Item Title</label>
        <input v-model="item.title"
               class="w-full border-b border-gray-200 py-2 text-sm font-bold focus:border-primary-500 focus:outline-none placeholder-gray-300 transition-colors bg-transparent text-gray-900"
               placeholder="e.g. Website Landing Page">
      </div>
      <div>
        <label class="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1 block">Description & Details</label>
        <textarea v-model="item.desc"
                  rows="3"
                  class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none placeholder-gray-300 transition-colors bg-gray-50/50 focus:bg-white resize-none text-gray-600 leading-relaxed"
                  placeholder="List item features, what is included, etc..."></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4 pt-2">
        <div>
          <label class="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1 block">Qty</label>
          <input type="number" v-model.number="item.qty" min="1"
                 class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-gray-700 bg-gray-50 focus:bg-white transition-colors">
        </div>
        <div class="relative">
          <label class="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-1 block">Unit Price</label>
          <input type="number" v-model.number="item.price" min="0"
                 class="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-gray-700 bg-gray-50 focus:bg-white transition-colors">
          <span class="absolute left-3 bottom-[8px] text-gray-400 font-bold text-sm">{{ currencySymbol }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Trash2 } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'
import { computed } from 'vue'

const store = useQuotationStore()

const props = defineProps({
  item: { type: Object, required: true },
  index: { type: Number, required: true },
  canRemove: { type: Boolean, default: true },
})

defineEmits(['remove'])

const currencySymbol = computed(() => store.currencySymbol)
</script>

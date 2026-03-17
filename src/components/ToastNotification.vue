<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="translate-y-20 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-300"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-20 opacity-0">
    <div v-if="store.toast.show"
         class="fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 font-medium text-white"
         :class="store.toast.isError ? 'bg-red-600' : 'bg-gray-900'">
      <AlertCircle v-if="store.toast.isError" class="w-5 h-5 text-white" />
      <CheckCircle v-else class="w-5 h-5 text-green-400" />
      <span>{{ store.toast.msg }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { CheckCircle, AlertCircle } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'

const store = useQuotationStore()
</script>

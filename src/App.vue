<template>
  <div class="h-screen overflow-hidden flex flex-col font-sans text-gray-800">
    <AppNavbar />

    <div class="flex-1 flex overflow-hidden">
      <EditorSidebar />
      <PdfPreview />
    </div>

    <ToastNotification />
    <PdfExportModal />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuotationStore } from './stores/quotation'
import AppNavbar from './components/AppNavbar.vue'
import EditorSidebar from './components/EditorSidebar.vue'
import PdfPreview from './components/PdfPreview.vue'
import ToastNotification from './components/ToastNotification.vue'
import PdfExportModal from './components/PdfExportModal.vue'

const store = useQuotationStore()

onMounted(() => {
  store.initDate()
})
</script>

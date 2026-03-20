<template>
  <div class="h-screen overflow-hidden flex flex-col font-sans text-gray-800">
    <AppNavbar />

    <div class="flex-1 flex overflow-hidden">
      <EditorSidebar />
      <PdfPreview />
    </div>

    <ToastNotification />
    <PdfExportModal />
    <ShortcutsHelpModal />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useQuotationStore } from './stores/quotation'
import AppNavbar from './components/AppNavbar.vue'
import EditorSidebar from './components/EditorSidebar.vue'
import PdfPreview from './components/PdfPreview.vue'
import ToastNotification from './components/ToastNotification.vue'
import PdfExportModal from './components/PdfExportModal.vue'
import ShortcutsHelpModal from './components/ShortcutsHelpModal.vue'

const store = useQuotationStore()

function handleKeydown(e) {
  // Check if user is typing in an input field
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
    if (e.key === 'Escape') e.target.blur()
    return
  }

  if (e.ctrlKey || e.metaKey) {
    if (e.key.toLowerCase() === 's') {
      e.preventDefault()
      store.exportToJson()
      return
    }
    if (e.key.toLowerCase() === 'p') {
      e.preventDefault()
      store.downloadPDF()
      return
    }
    if (e.key === '=' || e.key === '+') {
      e.preventDefault()
      store.zoomIn()
      return
    }
    if (e.key === '-') {
      e.preventDefault()
      store.zoomOut()
      return
    }
    if (e.key === '0') {
      e.preventDefault()
      store.resetZoom()
      return
    }
    if (e.key.toLowerCase() === 'o') {
      e.preventDefault()
      if (window.electronAPI?.isElectron) store.importFromJson()
      else document.getElementById('json-upload-input')?.click()
      return
    }
    if (e.key.toLowerCase() === 'i') {
      e.preventDefault()
      store.addItem()
      return
    }
  }
}

onMounted(() => {
  store.initDate()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

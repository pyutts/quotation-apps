<template>
  <main class="flex-1 bg-gray-100/50 overflow-y-auto p-10 flex justify-center no-scrollbar relative" id="previewContainer">

    <div id="pdf-wrapper">
      <template v-for="(page, pageIndex) in pages" :key="pageIndex">
        <!-- Page break indicator between pages -->
        <div v-if="pageIndex > 0" class="page-break-indicator">
          <span>Page {{ pageIndex + 1 }}</span>
        </div>

        <!-- The page itself -->
        <div class="pdf-page rounded-sm">
          <!-- Decorative top bar on first page -->
          <div v-if="pageIndex === 0" class="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-t-sm"></div>
          <div class="pdf-page-inner" v-html="page"></div>
        </div>
      </template>
    </div>

    <!-- Hidden measuring area -->
    <div id="pdf-render-area" ref="renderArea">
      <div v-html="store.fullContentHtml"></div>
    </div>

  </main>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { useQuotationStore } from '../stores/quotation'

const store = useQuotationStore()
const renderArea = ref(null)
const pages = ref([''])
let rafId = null

function calculatePages() {
  const area = renderArea.value
  if (!area) return

  // A4 height in px: 297mm at CSS 96dpi → ≈ 1122.5px
  // Subtract padding (top 20mm + bottom 20mm = 40mm ≈ 151px) → usable ≈ 971px
  const pageHeightPx = 971
  const totalHeight = area.scrollHeight

  if (totalHeight <= pageHeightPx) {
    pages.value = [store.fullContentHtml]
    return
  }

  // Multi-page: slice content by child nodes
  const children = area.firstElementChild?.children
  if (!children || children.length === 0) {
    pages.value = [store.fullContentHtml]
    return
  }

  let newPages = []
  let currentPageHtml = ''
  let currentHeight = 0

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const childHeight = child.offsetHeight +
      parseInt(getComputedStyle(child).marginTop || 0) +
      parseInt(getComputedStyle(child).marginBottom || 0)

    if (currentHeight + childHeight > pageHeightPx && currentPageHtml !== '') {
      newPages.push(currentPageHtml)
      currentPageHtml = child.outerHTML
      currentHeight = childHeight
    } else {
      currentPageHtml += child.outerHTML
      currentHeight += childHeight
    }
  }

  if (currentPageHtml) {
    newPages.push(currentPageHtml)
  }

  pages.value = newPages.length > 0 ? newPages : [store.fullContentHtml]
}

function schedulePageCalculation() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    nextTick(() => {
      calculatePages()
    })
  })
}

watch(() => store.fullContentHtml, () => {
  schedulePageCalculation()
})

onMounted(() => {
  nextTick(() => {
    calculatePages()
  })
})
</script>

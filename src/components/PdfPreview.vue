<template>
  <main class="flex-1 bg-gray-100/50 overflow-y-auto p-10 flex justify-center no-scrollbar relative"
    id="previewContainer" @wheel="handleWheel">

    <div id="pdf-wrapper" :style="{ transform: `scale(${store.zoomLevel})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }">
      <template v-for="(page, pageIndex) in pages" :key="pageIndex">
        <!-- Page break indicator between pages -->
        <div v-if="pageIndex > 0" class="page-break-indicator">
          <span>Page {{ pageIndex + 1 }}</span>
        </div>

        <!-- The page itself -->
        <div class="pdf-page rounded-sm">
          <!-- Decorative top bar on first page -->
          <div v-if="pageIndex === 0"
            class="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-primary-600 to-primary-500 rounded-t-sm">
          </div>
          <div class="pdf-page-inner" v-html="page"></div>
        </div>
      </template>
    </div>

    <!-- Hidden measuring area -->
    <div id="pdf-render-area" ref="renderArea">
      <div v-html="store.fullContentHtml"></div>
    </div>

    <!-- Zoom Controls -->
    <div class="fixed bottom-6 right-8 flex items-center bg-white shadow-xl rounded-full border border-gray-200 overflow-hidden z-20">
      <button @click="store.zoomOut()" class="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors" title="Zoom Out (Ctrl -)">
        <Minus class="w-4 h-4" />
      </button>
      <div class="px-2 text-sm font-semibold text-gray-700 select-none min-w-[3.5rem] text-center cursor-pointer hover:bg-gray-50 py-2.5" @click="store.resetZoom()" title="Reset Zoom (Ctrl 0)">
        {{ Math.round(store.zoomLevel * 100) }}%
      </div>
      <button @click="store.zoomIn()" class="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors" title="Zoom In (Ctrl +)">
        <Plus class="w-4 h-4" />
      </button>
    </div>

  </main>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'

const store = useQuotationStore()
const renderArea = ref(null)
const pages = ref([''])
let rafId = null

function handleWheel(e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    if (e.deltaY < 0) {
      store.zoomIn()
    } else {
      store.zoomOut()
    }
  }
}

function calculatePages() {
  const area = renderArea.value
  if (!area) return

  // A4 height in px: 297mm at CSS 96dpi → ≈ 1122.5px
  // Subtract padding (top 20mm + bottom 20mm = 40mm ≈ 151px) → usable ≈ 971px
  // We'll use 980px as a slightly more generous threshold to avoid premature breaking
  const pageHeightPx = 980
  const totalHeight = area.getBoundingClientRect().height

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

  // Helper to add html and height to current page
  const addToPage = (html, height) => {
    currentPageHtml += html
    currentHeight += height
  }

  // Helper to push current page and start a new one
  const startNewPage = (html, height) => {
    if (currentPageHtml) {
      newPages.push(currentPageHtml)
    }
    currentPageHtml = html
    currentHeight = height
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    let childRect = child.getBoundingClientRect()
    let childHeight = childRect.height +
      parseFloat(getComputedStyle(child).marginTop || 0) +
      parseFloat(getComputedStyle(child).marginBottom || 0)

    // If it's a table, we check if we need to split its rows
    if (child.tagName === 'TABLE' && child.classList.contains('pdf-table')) {
      const thead = child.querySelector('thead')
      const tbody = child.querySelector('tbody')
      
      let theadHeight = 0
      let theadHtml = ''
      if (thead) {
        theadHeight = thead.getBoundingClientRect().height
        theadHtml = thead.outerHTML
      }

      // If just adding the table header exceeds the page, start fresh
      if (currentHeight + theadHeight > pageHeightPx && currentPageHtml) {
        startNewPage('', 0)
      }

      // Start building the table HTML
      let currentTableHtml = `<table style="${child.getAttribute('style') || ''}" class="${child.className}">`
      if (thead) currentTableHtml += theadHtml
      currentTableHtml += '<tbody>'
      
      let currentTableHeight = theadHeight

      if (tbody) {
        const rows = tbody.children
        let rowsOnCurrentPage = 0

        for (let j = 0; j < rows.length; j++) {
          const row = rows[j]
          const rowHeight = row.getBoundingClientRect().height
          
          // If this row pushes us over the page limit AND we already have at least one row on this page
          // (If rowsOnCurrentPage === 0, it means the row itself is bigger than the page, so we MUST print it anyway to avoid infinite loop)
          if (currentHeight + currentTableHeight + rowHeight > pageHeightPx && rowsOnCurrentPage > 0) {
            // Close current table, push to page, and start new page
            currentTableHtml += '</tbody></table>'
            addToPage(currentTableHtml, currentTableHeight)
            startNewPage('', 0)
            
            // Start a new table on the new page
            currentTableHtml = `<table style="${child.getAttribute('style') || ''}" class="${child.className}">`
            if (thead) currentTableHtml += theadHtml
            currentTableHtml += '<tbody>'
            currentTableHeight = theadHeight
            rowsOnCurrentPage = 0
          }
          
          currentTableHtml += row.outerHTML
          currentTableHeight += rowHeight
          rowsOnCurrentPage++
        }
      }
      
      // Close the table and add whatever is left to the current page
      currentTableHtml += '</tbody></table>'
      
      // Add any remaining margin/padding height from the table wrapper itself
      const tableExtraDecorations = childHeight - (theadHeight + (tbody ? tbody.getBoundingClientRect().height : 0))
      currentTableHeight += Math.max(0, tableExtraDecorations) // Ensure it doesn't go negative due to rounding
      
      addToPage(currentTableHtml, currentTableHeight)

    } else {
      // Normal block element handling
      if (currentHeight + childHeight > pageHeightPx && currentPageHtml !== '') {
        startNewPage(child.outerHTML, childHeight)
      } else {
        addToPage(child.outerHTML, childHeight)
      }
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

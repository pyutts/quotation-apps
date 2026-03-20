<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0">
    <div v-if="store.showShortcutsModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/50" @click="close"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-3xl shadow-2xl w-[480px] overflow-hidden flex flex-col max-h-[90vh] fade-in">
        
        <!-- Header -->
        <div class="px-8 pt-8 pb-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Keyboard class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-extrabold text-xl text-gray-900 tracking-tight">Keyboard Shortcuts</h3>
              <p class="text-gray-500 text-sm font-medium mt-0.5">Work faster with these actions</p>
            </div>
          </div>
          <button @click="close" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 overflow-y-auto space-y-4.5 text-sm font-medium text-gray-600">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <Save class="w-4 h-4 text-gray-400" />
              <span>Save Settings (JSON)</span>
            </div>
            <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Ctrl + S</kbd>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <FolderOpen class="w-4 h-4 text-gray-400" />
              <span>Open / Load File</span>
            </div>
            <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Ctrl + O</kbd>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <Download class="w-4 h-4 text-gray-400" />
              <span>Export to PDF</span>
            </div>
            <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Ctrl + P</kbd>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <Plus class="w-4 h-4 text-gray-400" />
              <span>Add New Item</span>
            </div>
            <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Ctrl + I</kbd>
          </div>

          <div class="w-full h-px bg-gray-100 my-4"></div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <ZoomIn class="w-4 h-4 text-gray-400" />
              <span>Zoom In</span>
            </div>
            <div class="flex gap-1 items-center">
               <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Ctrl + +</kbd> <span class="text-xs text-gray-400 mx-1 flex items-center">or</span> <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Wheel</kbd>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <ZoomOut class="w-4 h-4 text-gray-400" />
              <span>Zoom Out</span>
            </div>
            <div class="flex gap-1 items-center">
              <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Ctrl + -</kbd> <span class="text-xs text-gray-400 mx-1 flex items-center">or</span> <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Wheel</kbd>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <Maximize class="w-4 h-4 text-gray-400" />
              <span>Reset Zoom</span>
            </div>
            <kbd class="px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 font-sans shadow-sm font-bold text-xs min-w-[30px] text-center inline-block">Ctrl + 0</kbd>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-8 pb-8 pt-4">
          <button @click="close" class="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-gray-900/20 transition-all hover:scale-[1.01] active:scale-[0.98]">
            Got it
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { Keyboard, X, Save, FolderOpen, Download, Plus, ZoomIn, ZoomOut, Maximize } from 'lucide-vue-next'
import { useQuotationStore } from '../stores/quotation'

const store = useQuotationStore()

function close() {
  store.showShortcutsModal = false
}
</script>



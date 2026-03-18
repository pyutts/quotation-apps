import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCurrencySymbol, formatMoney, formatDate } from '../utils/currency'
import { exportSettings, importSettings } from '../utils/saveData'

// ── Translations ──
const TRANSLATIONS = {
  en: {
    quote: 'Quote',
    quoteNo: 'Quote No:',
    date: 'Date:',
    billTo: 'Bill To',
    qty: 'Qty',
    description: 'Description',
    unitPrice: 'Unit Price',
    amount: 'Amount',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    termsTitle: 'Terms & Conditions',
    termsBody: 'Please make payment within 14 days of receiving this quote. All prices are subject to taxes as stated. Quote valid for 30 days. Let us know if you have any questions.',
    signature: 'Authorized Signature',
  },
  id: {
    quote: 'Penawaran',
    quoteNo: 'No. Penawaran:',
    date: 'Tanggal:',
    billTo: 'Kepada',
    qty: 'Jml',
    description: 'Deskripsi',
    unitPrice: 'Harga Satuan',
    amount: 'Jumlah',
    subtotal: 'Subtotal',
    tax: 'Pajak',
    total: 'Total',
    termsTitle: 'Syarat & Ketentuan',
    termsBody: 'Harap melakukan pembayaran dalam 14 hari setelah menerima penawaran ini. Semua harga sudah termasuk pajak sesuai yang tercantum. Penawaran berlaku selama 30 hari. Hubungi kami jika ada pertanyaan.',
    signature: 'Tanda Tangan',
  },
}

export const useQuotationStore = defineStore('quotation', () => {
  // ── State ──
  const companyName = ref('')
  const companyAddress = ref('')
  const logoSrc = ref('')
  const clientName = ref('')
  const clientAddress = ref('')
  const quoteNumber = ref('')
  const quoteDate = ref('')
  const taxRate = ref(10)
  const currency = ref('USD')
  const language = ref('en')
  const showSignature = ref(true)
  const pdfGenerating = ref(false)
  const showExportModal = ref(false)
  const nextId = ref(2)
  const items = ref([
    {
      id: 1,
      title: 'Website Landing Page',
      desc: 'Includes:\n- Custom UI/UX Design\n- Responsive Development\n- Basic SEO Setup\n- Contact Form Integration',
      qty: 1,
      price: 1500,
    },
  ])

  // Toast state
  const toast = ref({ show: false, msg: '', isError: false })

  // ── Computed ──
  const currencySymbol = computed(() => getCurrencySymbol(currency.value))

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0)
  )

  const tax = computed(() => subtotal.value * ((taxRate.value || 0) / 100))

  const total = computed(() => subtotal.value + tax.value)

  const formattedDate = computed(() => formatDate(quoteDate.value))

  const formattedMoney = (amount) => formatMoney(amount, currency.value)

  // ── Full content HTML for PDF preview ──
  const fullContentHtml = computed(() => {
    const t = TRANSLATIONS[language.value] || TRANSLATIONS.en
    const sym = currencySymbol.value
    const cName = 'MapingWeb'
    const cAddr = (companyAddress.value || 'Your Address\nCity, Country').replace(/\n/g, '<br>')
    const clName = clientName.value || 'Client Name'
    const clAddr = (clientAddress.value || 'Client Address').replace(/\n/g, '<br>')
    const qNum = quoteNumber.value || '#0001'

    const imgSrc = logoSrc.value || '/logo.png'
    const logoHtml = `<img src="${imgSrc}" class="object-contain" style="max-height:48px;margin-bottom:20px;">`

    const itemRows = items.value
      .map((item, i) => {
        const descHtml = item.desc
          ? `<p style="white-space:pre-line;color:#6b7280;font-size:13px;line-height:1.6;margin-top:6px;opacity:0.9">${item.desc}</p>`
          : ''
        return `
          <tr class="avoid-break" style="background:${i % 2 !== 0 ? 'rgba(249,250,251,0.5)' : 'transparent'}">
            <td style="text-align:center;font-weight:600;color:#6b7280;padding:16px">${item.qty || 0}</td>
            <td style="padding:16px 24px 16px 16px">
              <p style="font-weight:700;color:#111827;margin-bottom:4px;line-height:1.4">${item.title || '—'}</p>
              ${descHtml}
            </td>
            <td style="text-align:right;color:#4b5563;padding:16px;white-space:nowrap">${sym} ${formattedMoney(item.price)}</td>
            <td style="text-align:right;font-weight:700;color:#111827;padding:16px;white-space:nowrap">${sym} ${formattedMoney((item.qty || 0) * (item.price || 0))}</td>
          </tr>`
      })
      .join('')

    const signatureHtml = showSignature.value ? `
        <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;padding-top:16px">
          <div style="height:64px;border-bottom:2px solid #d1d5db;width:224px;margin-bottom:12px"></div>
          <p style="font-weight:700;color:#111827;font-size:15px">${t.signature}</p>
          <p style="color:#6b7280;font-size:13px;margin-top:4px;font-weight:500">${cName}</p>
        </div>` : ''

    const footerColumns = showSignature.value
      ? 'grid-template-columns:1fr 1fr;gap:64px'
      : 'grid-template-columns:1fr'

    return `
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:32px;margin-bottom:64px" class="avoid-break">
        <div style="max-width:50%">
          ${logoHtml}
          <h2 style="font-size:28px;font-weight:700;color:#111827;margin-bottom:8px;letter-spacing:-0.025em">${cName}</h2>
          <p style="color:#6b7280;line-height:1.6;font-size:15px">${cAddr}</p>
        </div>
        <div style="text-align:right">
          <h1 style="font-size:48px;font-weight:900;color:#e5e7eb;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:24px">${t.quote}</h1>
          <table style="margin-left:auto;text-align:left;font-size:15px">
            <tr>
              <td style="padding-right:32px;padding-top:6px;padding-bottom:6px;color:#6b7280;font-weight:500">${t.quoteNo}</td>
              <td style="font-weight:600;color:#111827">${qNum}</td>
            </tr>
            <tr>
              <td style="padding-right:32px;padding-top:6px;padding-bottom:6px;color:#6b7280;font-weight:500">${t.date}</td>
              <td style="font-weight:600;color:#111827">${formattedDate.value}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Bill To -->
      <div style="margin-bottom:56px" class="avoid-break">
        <h3 style="font-size:13px;font-weight:700;color:#165c6b;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px">${t.billTo}</h3>
        <h4 style="font-size:20px;font-weight:700;color:#111827;margin-bottom:6px">${clName}</h4>
        <p style="color:#6b7280;line-height:1.6;font-size:15px">${clAddr}</p>
      </div>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;font-size:15px;margin-bottom:40px" class="pdf-table">
        <thead>
          <tr>
            <th style="width:60px;text-align:center;text-transform:uppercase;letter-spacing:0.1em;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:12px;font-weight:600">${t.qty}</th>
            <th style="text-align:left;text-transform:uppercase;letter-spacing:0.1em;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:12px;font-weight:600">${t.description}</th>
            <th style="width:140px;text-align:right;text-transform:uppercase;letter-spacing:0.1em;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:12px;font-weight:600">${t.unitPrice}</th>
            <th style="width:140px;text-align:right;text-transform:uppercase;letter-spacing:0.1em;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;padding-bottom:12px;font-weight:600">${t.amount}</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:80px;margin-top:32px" class="avoid-break">
        <div style="width:320px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6">
            <span style="color:#6b7280;font-weight:500;font-size:15px">${t.subtotal}</span>
            <span style="font-weight:600;color:#111827;font-size:15px">${sym} ${formattedMoney(subtotal.value)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f3f4f6">
            <span style="color:#6b7280;font-weight:500;font-size:15px">${t.tax} (${taxRate.value || 0}%)</span>
            <span style="font-weight:600;color:#111827;font-size:15px">${sym} ${formattedMoney(tax.value)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:20px;margin-top:16px;background:#f9fafb;border-radius:16px;border:1px solid #f3f4f6">
            <span style="font-weight:700;font-size:20px;color:#111827">${t.total}</span>
            <span style="font-weight:700;font-size:20px;color:#165c6b">${sym} ${formattedMoney(total.value)}</span>
          </div>
        </div>
      </div>

      <!-- Footer: Terms & Signature -->
      <div style="display:grid;${footerColumns}" class="avoid-break">
        <div>
          <h3 style="font-size:13px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px">${t.termsTitle}</h3>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;padding-right:32px">
            ${t.termsBody}
          </p>
        </div>
        ${signatureHtml}
      </div>
    `
  })

  // ── Actions ──
  function initDate() {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    quoteDate.value = `${yyyy}-${mm}-${dd}`
    if (!quoteNumber.value) {
      generateQuoteNumber()
    }
  }

  function generateQuoteNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const year = new Date().getFullYear()
    quoteNumber.value = `MW-${year}-${code}`
  }

  function addItem() {
    items.value.push({ id: nextId.value++, title: '', desc: '', qty: 1, price: 0 })
  }

  function removeItem(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function setLogo(base64) {
    logoSrc.value = base64
  }

  function showToast(msg, isError = false) {
    toast.value = { show: true, msg, isError }
    setTimeout(() => {
      toast.value = { ...toast.value, show: false }
    }, 3000)
  }

  async function exportToJson() {
    try {
      const result = await exportSettings({
        companyName: companyName.value,
        companyAddress: companyAddress.value,
        logoSrc: logoSrc.value,
        clientName: clientName.value,
        clientAddress: clientAddress.value,
        quoteNumber: quoteNumber.value,
        quoteDate: quoteDate.value,
        taxRate: taxRate.value,
        currency: currency.value,
        language: language.value,
        showSignature: showSignature.value,
        items: items.value,
      })
      if (!result?.canceled) {
        showToast('Settings exported successfully!')
      }
    } catch (err) {
      showToast('Failed to export settings', true)
    }
  }

  async function importFromJson(file = null) {
    try {
      const s = await importSettings(file)
      // User cancelled (Electron dialog)
      if (s === null) return
      // Restore all fields
      if (s.companyName !== undefined) companyName.value = s.companyName
      if (s.companyAddress !== undefined) companyAddress.value = s.companyAddress
      if (s.logoSrc !== undefined) logoSrc.value = s.logoSrc
      if (s.clientName !== undefined) clientName.value = s.clientName
      if (s.clientAddress !== undefined) clientAddress.value = s.clientAddress
      if (s.quoteNumber !== undefined) quoteNumber.value = s.quoteNumber
      if (s.quoteDate !== undefined) quoteDate.value = s.quoteDate
      if (s.taxRate !== undefined) taxRate.value = s.taxRate
      if (s.currency !== undefined) currency.value = s.currency
      if (s.language !== undefined) language.value = s.language
      if (s.showSignature !== undefined) showSignature.value = s.showSignature
      if (s.items && Array.isArray(s.items)) {
        items.value = s.items
        nextId.value = Math.max(...s.items.map(i => i.id), 0) + 1
      }
      showToast('Settings loaded successfully!')
    } catch (err) {
      showToast(err.message || 'Failed to import settings', true)
    }
  }

  function downloadPDF() {
    showExportModal.value = true
  }

  return {
    // State
    companyName,
    companyAddress,
    logoSrc,
    clientName,
    clientAddress,
    quoteNumber,
    quoteDate,
    taxRate,
    currency,
    language,
    showSignature,
    pdfGenerating,
    showExportModal,
    items,
    toast,
    // Computed
    currencySymbol,
    subtotal,
    tax,
    total,
    formattedDate,
    fullContentHtml,
    // Methods
    formattedMoney,
    initDate,
    addItem,
    removeItem,
    setLogo,
    showToast,
    exportToJson,
    importFromJson,
    downloadPDF,
    generateQuoteNumber,
  }
})

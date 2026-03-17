/**
 * Currency formatting utilities
 */

const CURRENCY_CONFIGS = {
  IDR: { locale: 'id-ID', min: 0, max: 0, symbol: 'Rp' },
  USD: { locale: 'en-US', min: 2, max: 2, symbol: '$' },
  AUD: { locale: 'en-AU', min: 2, max: 2, symbol: 'A$' },
}

export function getCurrencySymbol(currency) {
  return CURRENCY_CONFIGS[currency]?.symbol || '$'
}

export function formatMoney(amount, currency) {
  const c = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD
  return (amount || 0).toLocaleString(c.locale, {
    minimumFractionDigits: c.min,
    maximumFractionDigits: c.max,
  })
}

export function formatDate(dateStr) {
  if (!dateStr) return 'DD/MM/YYYY'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

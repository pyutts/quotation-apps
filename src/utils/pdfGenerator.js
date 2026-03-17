/**
 * PDF Generation utility
 * Captures the visible preview pages directly using html2canvas + jsPDF.
 * Returns a Blob so the caller can decide how to save it.
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/**
 * Generate a PDF Blob by capturing visible preview pages
 * @returns {Promise<Blob>} The generated PDF as a Blob
 */
export async function generatePDFBlob() {
  const pageElements = document.querySelectorAll('.pdf-page')
  if (!pageElements.length) {
    throw new Error('No preview pages found')
  }

  // A4 dimensions in mm
  const pdfWidth = 210
  const pdfHeight = 297

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  })

  for (let i = 0; i < pageElements.length; i++) {
    const page = pageElements[i]

    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)

    if (i > 0) {
      pdf.addPage()
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
  }

  return pdf.output('blob')
}

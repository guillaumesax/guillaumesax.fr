import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { contractVersion } from './model';

const pageWidthMm = 210;
const pageHeightMm = 297;
const marginMm = 15;
const imageWidthMm = pageWidthMm - marginMm * 2;
const imageHeightMm = 260;
const captureWidthPx = 560;
const captureScale = 3;

function pageBreaks(element: HTMLElement, maximumHeight: number): number[] {
  const top = element.getBoundingClientRect().top;
  const height = Math.ceil(element.getBoundingClientRect().height);
  const blockBoundaries = Array.from(element.children, child =>
    Math.ceil(child.getBoundingClientRect().bottom - top + 8),
  ).filter(value => value > 0 && value < height);
  const lineBoundaries: number[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      const boundary = Math.ceil(rect.bottom - top + 3);
      if (boundary > 0 && boundary < height) lineBoundaries.push(boundary);
    }
  }
  lineBoundaries.sort((a, b) => a - b);
  const breaks = [0];
  let position = 0;

  while (position + maximumHeight < height) {
    const limit = position + maximumHeight;
    const blocks = blockBoundaries.filter(value => value > position + 50 && value <= limit);
    const lines = lineBoundaries.filter(value => value > position + 50 && value <= limit);
    // Keep whole sections together when the resulting whitespace is modest.
    const next = blocks.at(-1) && blocks.at(-1)! >= limit - 120
      ? blocks.at(-1)!
      : (lines.at(-1) ?? blocks.at(-1) ?? limit);
    breaks.push(next);
    position = next;
  }
  breaks.push(height);
  return breaks;
}

export async function generateContractPdf(preview: HTMLElement): Promise<Blob> {
  const capture = document.createElement('div');
  capture.className = 'pdf-capture';
  capture.style.cssText = `position:absolute;left:-10000px;top:0;width:${captureWidthPx}px;pointer-events:none;`;
  const copy = preview.cloneNode(true) as HTMLElement;
  copy.removeAttribute('aria-label');
  capture.appendChild(copy);
  document.body.appendChild(capture);

  try {
    await document.fonts.ready;
    await Promise.all(Array.from(copy.querySelectorAll('img'), image => image.decode().catch(() => undefined)));
    const maxSliceHeight = Math.floor(imageHeightMm * captureWidthPx / imageWidthMm);
    const breaks = pageBreaks(copy, maxSliceHeight);
    const canvas = await html2canvas(copy, {
      backgroundColor: '#fffefa',
      scale: captureScale,
      useCORS: true,
      logging: false,
      width: captureWidthPx,
      // html2canvas must use the same media-query width as the measured DOM.
      windowWidth: window.innerWidth,
      scrollX: 0,
      scrollY: -window.scrollY,
    });
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    for (let index = 0; index < breaks.length - 1; index++) {
      if (index) pdf.addPage();
      const start = Math.round(breaks[index] * captureScale);
      const end = Math.min(canvas.height, Math.round(breaks[index + 1] * captureScale));
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = end - start;
      const context = slice.getContext('2d');
      if (!context) throw new Error('Canvas indisponible');
      context.fillStyle = '#fffefa';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(canvas, 0, start, canvas.width, slice.height, 0, 0, slice.width, slice.height);
      const heightMm = slice.height / canvas.width * imageWidthMm;
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', marginMm, marginMm, imageWidthMm, heightMm, undefined, 'FAST');
      pdf.setDrawColor(216, 205, 187);
      pdf.line(marginMm, pageHeightMm - 15, pageWidthMm - marginMm, pageHeightMm - 15);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(126, 98, 54);
      pdf.text(`Guillaume Sax · ${contractVersion}`, marginMm, pageHeightMm - 10);
      pdf.text(`${index + 1} / ${breaks.length - 1}`, pageWidthMm - marginMm, pageHeightMm - 10, { align: 'right' });
    }
    return pdf.output('blob');
  } finally {
    capture.remove();
  }
}

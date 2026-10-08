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
  // Reserve page one for the parties and the prestation summary.
  const firstClause = element.querySelector('.clause');
  const firstClauseTop = firstClause
    ? Math.ceil(firstClause.getBoundingClientRect().top - top)
    : 0;
  const introFits = firstClauseTop > 0 && firstClauseTop <= maximumHeight;
  if (introFits) breaks.push(firstClauseTop);
  let position = breaks.at(-1)!;

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
  // When the last page would contain only a short tail, share the clauses
  // between pages two and three at a section boundary.
  if (introFits && breaks.length === 4 && height - breaks[2] < maximumHeight * 0.55) {
    const midpoint = (breaks[1] + height) / 2;
    const sectionStarts = Array.from(element.querySelectorAll('.clause, .document-tail'), section =>
      Math.ceil(section.getBoundingClientRect().top - top),
    ).filter(value => value > breaks[1] + 50 &&
      value - breaks[1] <= maximumHeight && height - value <= maximumHeight);
    const balanced = sectionStarts.sort((a, b) => Math.abs(a - midpoint) - Math.abs(b - midpoint))[0];
    if (balanced) breaks[2] = balanced;
  }
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
    if (!copy.querySelector('.document-tail img')) throw new Error('Signature absente du PDF');
    const maxSliceHeight = Math.floor(imageHeightMm * captureWidthPx / imageWidthMm);
    let breaks: number[] = [];
    let signatureBounds: { x: number; y: number; width: number; height: number } | null = null;
    const captureOptions = {
      backgroundColor: '#fffefa',
      scale: captureScale,
      useCORS: true,
      logging: false,
      width: captureWidthPx,
      // Use one desktop-sized layout on every device, including mobile Safari.
      windowWidth: 1024,
      scrollX: 0,
      scrollY: 0,
      onclone: (_document: Document, element: HTMLElement) => {
        const measured = pageBreaks(element, maxSliceHeight);
        if (breaks.length && (measured.length !== breaks.length ||
          measured.some((value, index) => Math.abs(value - breaks[index]) > 2))) {
          throw new Error('La mise en page du PDF a changé pendant la génération');
        }
        breaks = measured;
        const signature = element.querySelector('.document-tail img');
        if (!signature) throw new Error('Signature absente de la capture');
        const documentRect = element.getBoundingClientRect();
        const signatureRect = signature.getBoundingClientRect();
        signatureBounds = {
          x: signatureRect.left - documentRect.left,
          y: signatureRect.top - documentRect.top,
          width: signatureRect.width,
          height: signatureRect.height,
        };
      },
    };
    // Each canvas stays below mobile browsers' canvas-size limits. Measuring in
    // html2canvas's clone keeps page breaks aligned with the rendered text.
    const firstCanvas = await html2canvas(copy, { ...captureOptions, y: 0, height: maxSliceHeight });
    if (breaks.length < 2) throw new Error('Découpage du PDF indisponible');
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    let signatureInkFound = false;
    for (let index = 0; index < breaks.length - 1; index++) {
      if (index) pdf.addPage();
      const start = breaks[index];
      const pageHeight = breaks[index + 1] - start;
      const canvas = index === 0 ? firstCanvas : await html2canvas(copy, {
        ...captureOptions, y: start, height: pageHeight,
      });
      const sliceHeight = Math.round(pageHeight * captureScale);
      if (sliceHeight < 1 || canvas.height < sliceHeight - 2) {
        throw new Error('Une page du PDF est incomplète');
      }
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = sliceHeight;
      const context = slice.getContext('2d');
      if (!context) throw new Error('Canvas indisponible');
      context.fillStyle = '#fffefa';
      context.fillRect(0, 0, slice.width, slice.height);
      context.drawImage(canvas, 0, 0, canvas.width, slice.height, 0, 0, slice.width, slice.height);
      if (signatureBounds) {
        const x = Math.max(0, Math.floor(signatureBounds.x * captureScale));
        const y = Math.max(0, Math.floor((signatureBounds.y - start) * captureScale));
        const width = Math.min(slice.width - x, Math.ceil(signatureBounds.width * captureScale));
        const height = Math.min(slice.height - y, Math.ceil((signatureBounds.y + signatureBounds.height - start) * captureScale) - y);
        if (width > 0 && height > 0) {
          const pixels = context.getImageData(x, y, width, height).data;
          for (let offset = 0; offset < pixels.length; offset += 4) {
            if (pixels[offset + 3] > 100 && pixels[offset] < 120 &&
              pixels[offset + 1] < 120 && pixels[offset + 2] < 120) {
              signatureInkFound = true;
              break;
            }
          }
        }
      }
      const scale = Math.min(imageWidthMm / slice.width, imageHeightMm / slice.height);
      const widthMm = slice.width * scale;
      const heightMm = slice.height * scale;
      pdf.addImage(slice.toDataURL('image/png'), 'PNG', marginMm + (imageWidthMm - widthMm) / 2, marginMm, widthMm, heightMm, undefined, 'FAST');
      pdf.setDrawColor(216, 205, 187);
      pdf.line(marginMm, pageHeightMm - 15, pageWidthMm - marginMm, pageHeightMm - 15);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(126, 98, 54);
      pdf.text(`Guillaume Sax · ${contractVersion}`, marginMm, pageHeightMm - 10);
      pdf.text(`${index + 1} / ${breaks.length - 1}`, pageWidthMm - marginMm, pageHeightMm - 10, { align: 'right' });
    }
    if (!signatureInkFound) throw new Error('Signature manquante dans le PDF');
    return pdf.output('blob');
  } finally {
    capture.remove();
  }
}

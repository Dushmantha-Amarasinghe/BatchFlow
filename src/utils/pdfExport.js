import { jsPDF } from 'jspdf';

/**
 * Export batch list to PDF.
 * @param {Array} batchData - array of batch items
 * @param {Object|string} settings - pdfSettings object or legacy string title
 * @param {Object} qrDataUrls - map of batchCode -> data URL for QR images
 */
export async function exportBatchListToPdf(batchData, settings = {}, qrDataUrls = {}) {
    if (!batchData || batchData.length === 0) {
        throw new Error('No batch data available for export');
    }

    // Support legacy call: exportBatchListToPdf(data, "My Title")
    if (typeof settings === 'string') {
        settings = { title: settings };
    }

    const s = {
        title: 'Product Batch List',
        includeDate: true,
        includeProductName: true,
        includeProductCode: true,
        includePreviousBatch: true,
        includeNewBatch: true,
        includeQrCode: true,
        ...settings,
    };

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.width;   // 210
    const pageH = doc.internal.pageSize.height;  // 297
    const margin = 14;
    const contentW = pageW - margin * 2;

    // ── Header ──────────────────────────────────────────────────────────────
    // Dark background banner
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(s.title, margin, 16);

    if (s.includeDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 180);
        doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 23);
    }

    // Refora badge top-right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 80, 220);
    doc.text('BatchFlow by Refora Technologies', pageW - margin, 14, { align: 'right' });

    doc.setTextColor(30, 30, 30);

    let y = 38;

    // ── Table Header ─────────────────────────────────────────────────────────
    const hasQr = s.includeQrCode && Object.keys(qrDataUrls).length > 0;
    const qrSize = 18; // mm
    const qrPad = hasQr ? qrSize + 4 : 0;

    // Column definitions (widths in mm, within contentW - qrPad)
    const textW = contentW - qrPad;
    const cols = [];
    if (s.includeProductName) cols.push({ key: 'name', label: 'Product Name', flex: 2 });
    if (s.includeProductCode) cols.push({ key: 'code', label: 'Code', flex: 1 });
    if (s.includePreviousBatch && batchData.some(i => i.previousBatch)) cols.push({ key: 'prev', label: 'Previous Batch', flex: 1.2 });
    if (s.includeNewBatch) cols.push({ key: 'new', label: batchData.some(i => i.previousBatch) ? 'New Batch' : 'Current Batch', flex: 1.2 });

    const totalFlex = cols.reduce((sum, c) => sum + c.flex, 0);
    const colWidths = cols.map(c => (c.flex / totalFlex) * textW);

    // Header row background
    doc.setFillColor(30, 30, 50);
    doc.rect(margin, y - 5, contentW, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    let cx = margin;
    cols.forEach((col, i) => {
        doc.text(col.label.toUpperCase(), cx + 2, y);
        cx += colWidths[i];
    });
    if (hasQr) {
        doc.text('QR', cx + 2, y);
    }

    y += 8;

    // ── Rows ─────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    batchData.forEach((item, idx) => {
        const rowH = hasQr ? qrSize + 4 : 10;

        if (y + rowH > pageH - 20) {
            doc.addPage();
            y = 20;
        }

        // Alternating row background
        if (idx % 2 === 0) {
            doc.setFillColor(245, 245, 252);
            doc.rect(margin, y - 4, contentW, rowH, 'F');
        }

        doc.setTextColor(20, 20, 40);
        cx = margin;

        // Batch code for QR
        const batchCode = item.newBatch || item.currentBatch || '';

        cols.forEach((col, i) => {
            let val = '';
            if (col.key === 'name') val = item.productName || '';
            if (col.key === 'code') val = item.productCode || '';
            if (col.key === 'prev') val = item.previousBatch || '—';
            if (col.key === 'new') val = batchCode;

            // Clamp text
            if (val.length > 22) val = val.substring(0, 20) + '…';
            const textY = hasQr ? y + (qrSize / 2) - 2 : y;
            doc.text(val, cx + 2, textY);
            cx += colWidths[i];
        });

        // QR Code image
        if (hasQr && qrDataUrls[batchCode]) {
            try {
                doc.addImage(qrDataUrls[batchCode], 'PNG', cx + 2, y - 2, qrSize, qrSize);
            } catch { /* skip if QR not available */ }
        }

        // Separator line
        doc.setDrawColor(220, 220, 235);
        doc.setLineWidth(0.2);
        doc.line(margin, y + rowH - 3, pageW - margin, y + rowH - 3);

        y += rowH;
    });

    // ── Footer ────────────────────────────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 180);
        doc.text(`BatchFlow · Page ${i} of ${totalPages}`, pageW / 2, pageH - 8, { align: 'center' });
        doc.text('reforatech.com', pageW - margin, pageH - 8, { align: 'right' });
    }

    const fileName = `batchflow-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

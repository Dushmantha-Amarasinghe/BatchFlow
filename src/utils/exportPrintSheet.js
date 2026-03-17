/**
 * exportPrintSheet.js
 * Generates a printable A4 PDF grid of QR codes or CODE128 barcodes.
 */
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { generateBarcode } from './barcodeGenerator';

/**
 * @param {Array<{productName: string, productCode: string, newBatch?: string, currentBatch?: string}>} batchList
 * @param {'qr' | 'barcode' | 'both'} type
 * @param {{ perRow?: number, showLabel?: boolean, fontSize?: number }} opts
 */
export async function exportPrintSheet(batchList, type = 'qr', opts = {}) {
    const perRow = opts.perRow ?? 4;
    const showLabel = opts.showLabel ?? true;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 10;
    const cellW = (pageW - margin * 2) / perRow;

    // Heights depend on type
    const qrSize = cellW - 8;            // square QR
    const barcodeH = Math.min(24, cellW * 0.5);  // barcode rectangle
    const labelH = showLabel ? 8 : 0;

    // Cell height: for 'both' we stack QR + barcode
    let cellH;
    if (type === 'both') {
        cellH = qrSize + barcodeH + labelH + 12;
    } else if (type === 'qr') {
        cellH = qrSize + labelH + 8;
    } else {
        cellH = barcodeH + labelH + 12;
    }

    // Column & rows math for fitting on page
    const usableH = pageH - margin * 2;
    // Estimate rows per page
    const rowsPerPage = Math.floor(usableH / cellH);

    let col = 0;
    let row = 0;
    let page = 1;

    // Dark header bar
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageW, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 150, 255);
    const typeLabel = type === 'both' ? 'QR Codes & Barcodes' : type === 'qr' ? 'QR Codes' : 'Barcodes';
    doc.text(`BatchFlow · ${typeLabel} Print Sheet`, margin, 8);
    doc.setTextColor(100, 100, 120);
    doc.text(`${batchList.length} items · ${perRow} per row`, pageW - margin, 8, { align: 'right' });

    const startY = 16;

    for (let i = 0; i < batchList.length; i++) {
        const item = batchList[i];
        const code = item.newBatch || item.currentBatch || '';
        const displayName = item.productName || code;

        if (i > 0 && (col === 0 && row > 0 || row === rowsPerPage)) {
            // new page already handled below
        }
        if (row >= rowsPerPage) {
            doc.addPage();
            page++;
            // header on new page
            doc.setFillColor(10, 10, 10);
            doc.rect(0, 0, pageW, 12, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(180, 150, 255);
            doc.text(`BatchFlow · ${typeLabel} Print Sheet`, margin, 8);
            doc.setTextColor(100, 100, 120);
            doc.text(`Page ${page}`, pageW - margin, 8, { align: 'right' });

            row = 0;
            col = 0;
        }

        const x = margin + col * cellW;
        const y = startY + row * cellH;

        // Cell border (light)
        doc.setDrawColor(230, 230, 240);
        doc.setLineWidth(0.2);
        doc.rect(x + 2, y + 2, cellW - 4, cellH - 4);

        let innerY = y + 5;

        // QR Code
        if ((type === 'qr' || type === 'both') && code) {
            try {
                const qrDataUrl = await QRCode.toDataURL(code, {
                    width: 256,
                    margin: 2,
                    errorCorrectionLevel: 'H',
                    color: { dark: '#000000', light: '#ffffff' },
                });
                const imgSize = type === 'both' ? Math.min(qrSize * 0.6, cellW - 10) : qrSize - 4;
                const imgX = x + (cellW - imgSize) / 2;
                doc.addImage(qrDataUrl, 'PNG', imgX, innerY, imgSize, imgSize);
                innerY += imgSize + 2;
            } catch (e) { /* skip */ }
        }

        // Barcode
        if ((type === 'barcode' || type === 'both') && code) {
            try {
                const bcDataUrl = await generateBarcode(code, {
                    width: 1.5,
                    height: 40,
                    displayValue: false,
                    margin: 4,
                });
                const bcW = cellW - 10;
                const bcH = barcodeH;
                const bcX = x + (cellW - bcW) / 2;
                doc.addImage(bcDataUrl, 'PNG', bcX, innerY, bcW, bcH);
                innerY += bcH + 2;
            } catch (e) { /* skip */ }
        }

        // Label
        if (showLabel && code) {
            doc.setFont('courier', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(20, 20, 40);
            const labelText = code.length > 20 ? code.substring(0, 18) + '…' : code;
            doc.text(labelText, x + cellW / 2, innerY + 3, { align: 'center' });

            if (displayName !== code) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5.5);
                doc.setTextColor(80, 80, 100);
                const nameText = displayName.length > 22 ? displayName.substring(0, 20) + '…' : displayName;
                doc.text(nameText, x + cellW / 2, innerY + 7, { align: 'center' });
            }
        }

        col++;
        if (col >= perRow) {
            col = 0;
            row++;
        }
    }

    // Footer on last page
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 180);
        doc.text(`BatchFlow · reforatech.com · Page ${p} of ${totalPages}`, pageW / 2, pageH - 5, { align: 'center' });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`batchflow-${type}-sheet-${dateStr}.pdf`);
}

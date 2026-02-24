import { jsPDF } from 'jspdf';
import { loadPdfSettings } from '../services/db';

export async function exportBatchListToPdf(batchData, customTitle = null) {
    if (!batchData || batchData.length === 0) {
        throw new Error("No batch data available for export");
    }

    const pdfSettings = await loadPdfSettings() || {
        title: "Product Batch List",
        includeDate: true,
        includeProductName: true,
        includeProductCode: true,
        includePreviousBatch: true,
        includeNewBatch: true,
    };

    if (customTitle) {
        pdfSettings.title = customTitle;
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(pdfSettings.title, 14, 22);

    let startY = 35;
    if (pdfSettings.includeDate) {
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
        startY = 45;
    }

    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    const columns = [];

    if (pdfSettings.includeProductName) columns.push({ text: "Product Name", width: 50 });
    if (pdfSettings.includeProductCode) columns.push({ text: "Code", width: 25 });
    if (pdfSettings.includePreviousBatch && batchData[0].previousBatch) columns.push({ text: "Previous", width: 35 });
    if (pdfSettings.includeNewBatch) columns.push({
        text: batchData[0].previousBatch ? "New Batch" : "Current Batch",
        width: 35,
    });

    const totalWidth = pageWidth - 2 * margin;
    const colWidth = totalWidth / columns.length;

    let currentX = margin;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    columns.forEach((col) => {
        doc.text(col.text, currentX, startY);
        currentX += colWidth;
    });

    startY += 6;
    doc.setLineWidth(0.5);
    doc.line(margin, startY, pageWidth - margin, startY);
    startY += 10;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    batchData.forEach((item) => {
        currentX = margin;

        if (pdfSettings.includeProductName) {
            doc.text(item.productName.substring(0, 25), currentX, startY);
            currentX += colWidth;
        }

        if (pdfSettings.includeProductCode) {
            doc.text(item.productCode, currentX, startY);
            currentX += colWidth;
        }

        if (pdfSettings.includePreviousBatch && item.previousBatch) {
            doc.text(item.previousBatch, currentX, startY);
            currentX += colWidth;
        }

        if (pdfSettings.includeNewBatch) {
            doc.text(item.newBatch || item.currentBatch, currentX, startY);
        }

        startY += 7;

        if (startY > 270) {
            doc.addPage();
            startY = 20;
        }
    });

    const fileName = `batch-list-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
}

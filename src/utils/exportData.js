/**
 * exportData.js
 * Exports all user data from Firestore as a downloadable CSV file.
 */
import { loadProducts, loadCategories, loadAllBatchHistory, loadPdfSettings, loadWebhookSettings } from '../services/db';

function escapeCSV(val) {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
}

function toCSVRows(headers, rows) {
    const headerLine = headers.map(escapeCSV).join(',');
    const dataLines = rows.map(row => headers.map(h => escapeCSV(row[h])).join(','));
    return [headerLine, ...dataLines].join('\r\n');
}

function timestampToStr(ts) {
    if (!ts) return '';
    if (ts.toDate) return ts.toDate().toLocaleString();
    return String(ts);
}

export async function exportAllDataAsCSV() {
    const [products, categories, history, pdfSettings, webhookSettings] = await Promise.all([
        loadProducts(),
        loadCategories(),
        loadAllBatchHistory(),
        loadPdfSettings(),
        loadWebhookSettings(),
    ]);

    const sections = [];

    // ── Products ──────────────────────────────────────────────────────────
    sections.push('=== PRODUCTS ===');
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const productRows = products.map(p => ({
        'Product Name': p.name,
        'Product Code': p.code,
        'Category': catMap[p.categoryId] || p.categoryId || '',
        'Current Batch': p.currentBatch || '',
        'Last Updated': timestampToStr(p.lastUpdated),
        'Created At': timestampToStr(p.createdAt),
    }));
    sections.push(toCSVRows(['Product Name', 'Product Code', 'Category', 'Current Batch', 'Last Updated', 'Created At'], productRows));

    sections.push('');
    // ── Categories ────────────────────────────────────────────────────────
    sections.push('=== CATEGORIES ===');
    const categoryRows = categories.map(c => ({
        'Category Name': c.name,
        'Created At': timestampToStr(c.createdAt),
    }));
    sections.push(toCSVRows(['Category Name', 'Created At'], categoryRows));

    sections.push('');
    // ── Batch History ─────────────────────────────────────────────────────
    sections.push('=== BATCH HISTORY ===');
    const historyRows = [];
    history.forEach(entry => {
        if (!entry.batches?.length) {
            historyRows.push({
                'Batch List Date': timestampToStr(entry.date),
                'Type': entry.type || '',
                'Materials Used': entry.materials || '',
                'Product Name': '',
                'Product Code': '',
                'Previous Batch': '',
                'New Batch': '',
            });
        } else {
            entry.batches.forEach(b => {
                historyRows.push({
                    'Batch List Date': timestampToStr(entry.date),
                    'Type': entry.type || '',
                    'Materials Used': entry.materials || '',
                    'Product Name': b.productName || '',
                    'Product Code': b.productCode || '',
                    'Previous Batch': b.previousBatch || '',
                    'New Batch': b.newBatch || b.currentBatch || '',
                });
            });
        }
    });
    const histHeaders = ['Batch List Date', 'Type', 'Materials Used', 'Product Name', 'Product Code', 'Previous Batch', 'New Batch'];
    sections.push(toCSVRows(histHeaders, historyRows));

    sections.push('');
    // ── Settings ──────────────────────────────────────────────────────────
    sections.push('=== SETTINGS ===');
    const settingsRows = [];
    if (pdfSettings) {
        Object.entries(pdfSettings).forEach(([k, v]) => {
            settingsRows.push({ 'Setting': `PDF: ${k}`, 'Value': String(v) });
        });
    }
    if (webhookSettings) {
        settingsRows.push({ 'Setting': 'Webhook URL', 'Value': webhookSettings.url || '' });
        settingsRows.push({ 'Setting': 'Webhook Enabled', 'Value': String(webhookSettings.enabled || false) });
    }
    sections.push(toCSVRows(['Setting', 'Value'], settingsRows));

    // ── Build & Download ──────────────────────────────────────────────────
    const csv = sections.join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel compat
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batchflow-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

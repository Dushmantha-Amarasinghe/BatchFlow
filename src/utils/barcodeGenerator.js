/**
 * barcodeGenerator.js
 * Generates CODE128 barcode as a PNG data URL using JsBarcode + canvas.
 * Works in the browser only.
 */
import JsBarcode from 'jsbarcode';

/**
 * @param {string} text - the batch code to encode
 * @param {{ width?: number, height?: number }} opts
 * @returns {Promise<string>} PNG data URL
 */
export function generateBarcode(text, opts = {}) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, text, {
                format: 'CODE128',
                width: opts.width ?? 2,
                height: opts.height ?? 60,
                displayValue: opts.displayValue ?? true,
                margin: opts.margin ?? 8,
                background: '#ffffff',
                lineColor: '#000000',
                fontSize: opts.fontSize ?? 12,
                fontOptions: 'bold',
                textMargin: 4,
            });
            resolve(canvas.toDataURL('image/png'));
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Generate barcodes for an array of batch items.
 * @param {Array<{newBatch?: string, currentBatch?: string}>} batchList
 * @returns {Promise<Record<string, string>>} map of batchCode → data URL
 */
export async function generateBarcodes(batchList) {
    const result = {};
    await Promise.all(
        batchList.map(async (item) => {
            const code = item.newBatch || item.currentBatch || item.batchCode;
            if (code && !result[code]) {
                try {
                    result[code] = await generateBarcode(code);
                } catch (e) {
                    console.warn('Barcode generation failed for', code, e);
                }
            }
        })
    );
    return result;
}

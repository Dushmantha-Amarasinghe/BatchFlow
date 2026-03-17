import React, { useState, useEffect } from 'react';
import { loadProducts, saveProduct, saveBatchHistory, loadPdfSettings, savePdfSettings } from '../services/db';
import { useNotification } from '../contexts/NotificationContext';
import { exportBatchListToPdf } from '../utils/pdfExport';
import { exportPrintSheet } from '../utils/exportPrintSheet';
import { generateBarcodes } from '../utils/barcodeGenerator';
import QRCode from 'qrcode';

export default function NewBatch() {
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [materials, setMaterials] = useState('');
    const { showNotification } = useNotification();

    const [showSelectModal, setShowSelectModal] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [exporting, setExporting] = useState('');

    const [currentBatchData, setCurrentBatchData] = useState(null);
    const [batchTitle, setBatchTitle] = useState('');
    const [qrDataUrls, setQrDataUrls] = useState({});
    const [barcodeDataUrls, setBarcodeDataUrls] = useState({});

    const [pdfSettings, setPdfSettings] = useState({
        title: 'Product Batch List',
        includeDate: true,
        includeProductName: true,
        includeProductCode: true,
        includePreviousBatch: true,
        includeNewBatch: true,
        includeQrCode: true,
        includeBarcodeInPdf: false,
        printMediaPreference: 'qr', // 'qr' | 'barcode' | 'both'
        printPerRow: 4,
        printShowLabel: true,
    });

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        try {
            const [prods, settings] = await Promise.all([loadProducts(), loadPdfSettings()]);
            setProducts(prods);
            if (settings) setPdfSettings(prev => ({ ...prev, ...settings }));
        } catch (err) { console.error(err); }
    }

    async function generateMediaUrls(batchList) {
        const qrs = {};
        const bars = {};
        await Promise.all(batchList.map(async item => {
            const code = item.newBatch || item.currentBatch;
            if (!code) return;
            try {
                qrs[code] = await QRCode.toDataURL(code, {
                    width: 256, margin: 2, errorCorrectionLevel: 'H',
                    color: { dark: '#000000', light: '#ffffff' },
                });
            } catch { /* skip */ }
            try {
                const { generateBarcode } = await import('../utils/barcodeGenerator');
                bars[code] = await generateBarcode(code, { width: 2, height: 60, displayValue: true });
            } catch { /* skip */ }
        }));
        return { qrs, bars };
    }

    const filteredForSelect = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const allSelected = filteredForSelect.length > 0 && filteredForSelect.every(p => selectedIds.includes(p.id));

    function toggleSelectAll() {
        if (allSelected) {
            setSelectedIds(selectedIds.filter(id => !filteredForSelect.some(p => p.id === id)));
        } else {
            const newIds = new Set([...selectedIds, ...filteredForSelect.map(p => p.id)]);
            setSelectedIds(Array.from(newIds));
        }
    }
    function toggleProduct(id) {
        setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
    }

    async function generateNewBatchList() {
        if (selectedIds.length === 0) { showNotification('Select at least one product', 'warning'); return; }
        setGenerating(true);
        try {
            const selectedProducts = products.filter(p => selectedIds.includes(p.id));
            const newBatchList = [];
            for (const product of selectedProducts) {
                const previousBatch = product.currentBatch || `${product.code}-0000`;
                const parts = previousBatch.split('-');
                let nextNum = 1;
                if (parts.length > 1) {
                    const parsed = parseInt(parts[parts.length - 1], 10);
                    if (!isNaN(parsed)) nextNum = parsed + 1;
                }
                const newBatch = `${product.code}-${nextNum.toString().padStart(4, '0')}`;
                newBatchList.push({ productId: product.id, productName: product.name, productCode: product.code, previousBatch, newBatch });
                product.currentBatch = newBatch;
                await saveProduct(product);
            }
            await saveBatchHistory({ batches: newBatchList, type: 'new', materials: materials.trim() || null });
            const { qrs, bars } = await generateMediaUrls(newBatchList);
            setQrDataUrls(qrs);
            setBarcodeDataUrls(bars);
            setCurrentBatchData(newBatchList);
            setBatchTitle('New Batch List');
            setShowSelectModal(false);
            setSelectedIds([]);
            showNotification(`${newBatchList.length} new batch${newBatchList.length !== 1 ? 'es' : ''} generated!`, 'success');
            const prods = await loadProducts();
            setProducts(prods);
        } catch (err) {
            console.error(err);
            showNotification('Error generating batches', 'error');
        } finally {
            setGenerating(false);
        }
    }

    async function generateCurrentBatchList() {
        if (products.length === 0) { showNotification('No products found', 'warning'); return; }
        const currentBatchList = products.map(p => ({ productId: p.id, productName: p.name, productCode: p.code, currentBatch: p.currentBatch, newBatch: p.currentBatch }));
        const { qrs, bars } = await generateMediaUrls(currentBatchList);
        setQrDataUrls(qrs);
        setBarcodeDataUrls(bars);
        setCurrentBatchData(currentBatchList);
        setBatchTitle('Current Batch List');
    }

    async function handlePdfSettingsSubmit(e) {
        e.preventDefault();
        await savePdfSettings(pdfSettings);
        setShowPdfModal(false);
        showNotification('Settings saved', 'success');
    }

    async function handleExportMainPdf() {
        if (!currentBatchData?.length) { showNotification('No batch data', 'warning'); return; }
        setExporting('pdf');
        try {
            await exportBatchListToPdf(currentBatchData, pdfSettings, pdfSettings.includeQrCode ? qrDataUrls : {});
            showNotification('PDF exported', 'success');
        } catch (err) { showNotification('Error exporting PDF', 'error'); }
        finally { setExporting(''); }
    }

    async function handleExportPrintSheet(type) {
        if (!currentBatchData?.length) { showNotification('No batch data', 'warning'); return; }
        setExporting(type);
        try {
            await exportPrintSheet(currentBatchData, type, {
                perRow: pdfSettings.printPerRow ?? 4,
                showLabel: pdfSettings.printShowLabel ?? true,
            });
            showNotification(`${type === 'qr' ? 'QR' : type === 'barcode' ? 'Barcode' : 'QR & Barcode'} sheet exported`, 'success');
        } catch (err) { console.error(err); showNotification('Error exporting print sheet', 'error'); }
        finally { setExporting(''); }
    }

    return (
        <div className="tab-content active" id="new-batch">
            <div className="page-header">
                <h1 className="page-title">Generate Batch List</h1>
                <p className="page-subtitle">Create new batch numbers or view current batches for all products.</p>
            </div>

            {/* Action Card */}
            <div className="card">
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
                    <button className="btn btn-primary" onClick={() => setShowSelectModal(true)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>generating_tokens</span>
                        New Batches
                    </button>
                    <button className="btn btn-secondary" onClick={generateCurrentBatchList}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>list_alt</span>
                        Current List
                    </button>
                    {currentBatchData && (<>
                        <button className="btn btn-success" onClick={handleExportMainPdf} disabled={!!exporting}>
                            {exporting === 'pdf' ? <div className="loading" /> : <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>picture_as_pdf</span>}
                            Export PDF
                        </button>
                        <button className="btn" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }} onClick={() => handleExportPrintSheet('qr')} disabled={!!exporting}>
                            {exporting === 'qr' ? <div className="loading" /> : <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>qr_code_2</span>}
                            Export QRs
                        </button>
                        <button className="btn" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }} onClick={() => handleExportPrintSheet('barcode')} disabled={!!exporting}>
                            {exporting === 'barcode' ? <div className="loading" /> : <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>barcode</span>}
                            Export Barcodes
                        </button>
                    </>)}
                    <button className="btn btn-ghost" onClick={() => setShowPdfModal(true)}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>tune</span>
                        Settings
                    </button>
                </div>

                {/* Materials field */}
                <div className="materials-section">
                    <div className="materials-label">
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>biotech</span>
                        Micro-Traceability — Materials Used (optional)
                    </div>
                    <textarea className="form-control" rows={3} placeholder="e.g., Lavender Oil from Supplier X (Lot #LV-2024-03), Coconut Base (Lot #CB-2024-01)…" value={materials} onChange={e => setMaterials(e.target.value)} />
                    <div className="form-hint">Saved with the batch for recall traceability.</div>
                </div>
            </div>

            {/* Batch Results */}
            {currentBatchData && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                        <h2 className="section-title" style={{ marginBottom: 0 }}>{batchTitle}</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentBatchData.length} product{currentBatchData.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="batch-list">
                        {currentBatchData.map((item, idx) => {
                            const batchCode = item.newBatch || item.currentBatch;
                            const isNew = !!item.previousBatch;
                            return (
                                <div key={item.productId + idx} className="batch-card">
                                    <div className="batch-header">
                                        <div className="batch-product-name">{item.productName}</div>
                                        <span className={`batch-type-badge ${isNew ? 'new' : 'current'}`}>{isNew ? 'New' : 'Current'}</span>
                                    </div>
                                    <div className="batch-numbers">
                                        <div className="batch-number-item">
                                            <span className="batch-label">Code</span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.productCode}</span>
                                        </div>
                                        {isNew && (
                                            <div className="batch-number-item">
                                                <span className="batch-label">Previous</span>
                                                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.previousBatch}</span>
                                            </div>
                                        )}
                                        <div className="batch-number-item">
                                            <span className="batch-label">{isNew ? 'New Batch' : 'Current'}</span>
                                            <span className="batch-value">{batchCode}</span>
                                        </div>
                                    </div>
                                    {/* Media */}
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                                        {qrDataUrls[batchCode] && (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>QR Code</div>
                                                <img src={qrDataUrls[batchCode]} alt={`QR ${batchCode}`} style={{ width: '72px', height: '72px', imageRendering: 'pixelated', borderRadius: '6px', background: 'white', padding: '4px' }} />
                                            </div>
                                        )}
                                        {barcodeDataUrls[batchCode] && (
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Barcode</div>
                                                <img src={barcodeDataUrls[batchCode]} alt={`Barcode ${batchCode}`} style={{ height: '48px', maxWidth: '140px', borderRadius: '4px', background: 'white', padding: '4px 6px' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Product Selection Modal */}
            {showSelectModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Select Products for Batch</h2>
                            <button className="modal-close" onClick={() => setShowSelectModal(false)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                            </button>
                        </div>
                        <div className="search-container" style={{ marginBottom: '12px' }}>
                            <span className="material-symbols-outlined">search</span>
                            <input type="text" placeholder="Search products…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="select-all-container">
                            <label><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /><span>Select All</span></label>
                            <span className="product-count">{selectedIds.length} / {filteredForSelect.length}</span>
                        </div>
                        <div className="product-select-list">
                            {filteredForSelect.map(p => (
                                <div key={p.id} className={`product-select-item ${selectedIds.includes(p.id) ? 'selected' : ''}`} onClick={() => toggleProduct(p.id)}>
                                    <input type="checkbox" checked={selectedIds.includes(p.id)} readOnly />
                                    <div className="product-select-info">
                                        <div className="product-select-name">{p.name}</div>
                                        <div className="product-select-code">{p.code} · {p.currentBatch}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="form-buttons" style={{ marginTop: '16px' }}>
                            <button className="btn btn-ghost" onClick={() => setShowSelectModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={generateNewBatchList} disabled={generating || selectedIds.length === 0}>
                                {generating ? <><div className="loading" /> Generating…</> : <><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>generating_tokens</span> Generate ({selectedIds.length})</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF & Print Settings Modal */}
            {showPdfModal && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '8px', color: '#a78bfa' }}>tune</span>
                                PDF &amp; Print Settings
                            </h2>
                            <button className="modal-close" onClick={() => setShowPdfModal(false)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                            </button>
                        </div>
                        <form onSubmit={handlePdfSettingsSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Batch PDF Columns</div>
                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                    <label className="form-label">PDF Title</label>
                                    <input type="text" className="form-control" value={pdfSettings.title} onChange={e => setPdfSettings({ ...pdfSettings, title: e.target.value })} />
                                </div>
                                {[
                                    { key: 'includeDate', label: 'Include Generation Date' },
                                    { key: 'includeProductName', label: 'Product Name' },
                                    { key: 'includeProductCode', label: 'Product Code' },
                                    { key: 'includePreviousBatch', label: 'Previous Batch Number' },
                                    { key: 'includeNewBatch', label: 'New Batch Number' },
                                    { key: 'includeQrCode', label: 'QR Code per Row' },
                                ].map(({ key, label }) => (
                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
                                        <label className="toggle-switch">
                                            <input type="checkbox" checked={pdfSettings[key] ?? true} onChange={e => setPdfSettings({ ...pdfSettings, [key]: e.target.checked })} />
                                            <span className="toggle-track" />
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Print Sheet Settings</div>
                                <div className="form-group" style={{ marginBottom: '12px' }}>
                                    <label className="form-label">Items Per Row</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[2, 3, 4, 5, 6].map(n => (
                                            <button key={n} type="button"
                                                onClick={() => setPdfSettings({ ...pdfSettings, printPerRow: n })}
                                                style={{
                                                    padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                                    background: pdfSettings.printPerRow === n ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
                                                    color: pdfSettings.printPerRow === n ? '#a78bfa' : 'var(--text-secondary)',
                                                    fontFamily: "monospace", fontWeight: 600,
                                                    border: pdfSettings.printPerRow === n ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border-subtle)',
                                                    transition: 'all 0.15s ease',
                                                }}>
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="form-hint">Columns per row on the QR / Barcode print sheet</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Show Batch Code Label</span>
                                    <label className="toggle-switch">
                                        <input type="checkbox" checked={pdfSettings.printShowLabel ?? true} onChange={e => setPdfSettings({ ...pdfSettings, printShowLabel: e.target.checked })} />
                                        <span className="toggle-track" />
                                    </label>
                                </div>
                            </div>

                            <div className="form-buttons">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowPdfModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>
                                    Save Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

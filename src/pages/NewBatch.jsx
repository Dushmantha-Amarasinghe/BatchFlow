import React, { useState, useEffect } from 'react';
import { loadProducts, saveProduct, saveBatchHistory, loadPdfSettings, savePdfSettings } from '../services/db';
import { useNotification } from '../contexts/NotificationContext';
import { exportBatchListToPdf } from '../utils/pdfExport';

export default function NewBatch() {
    const [products, setProducts] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { showNotification } = useNotification();

    // Modals state
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    // Batch Data state
    const [currentBatchData, setCurrentBatchData] = useState(null);
    const [batchTitle, setBatchTitle] = useState("");

    // PDF Settings
    const [pdfSettings, setPdfSettings] = useState({
        title: "Product Batch List",
        includeDate: true,
        includeProductName: true,
        includeProductCode: true,
        includePreviousBatch: true,
        includeNewBatch: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [prods, settings] = await Promise.all([
                loadProducts(),
                loadPdfSettings()
            ]);
            setProducts(prods);
            if (settings) {
                setPdfSettings(settings);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // --- Select Modal Handlers ---
    const filteredForSelect = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const allSelected = filteredForSelect.length > 0 && filteredForSelect.every(p => selectedIds.includes(p.id));

    function toggleSelectAll() {
        if (allSelected) {
            const remaining = selectedIds.filter(id => !filteredForSelect.some(p => p.id === id));
            setSelectedIds(remaining);
        } else {
            const newIds = new Set([...selectedIds, ...filteredForSelect.map(p => p.id)]);
            setSelectedIds(Array.from(newIds));
        }
    }

    function toggleProduct(id) {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    }

    // --- Batch Generation ---
    async function generateNewBatchList() {
        if (selectedIds.length === 0) {
            showNotification("Please select at least one product.", "warning");
            return;
        }

        const selectedProducts = products.filter(p => selectedIds.includes(p.id));
        const newBatchList = [];

        for (const product of selectedProducts) {
            const previousBatch = product.currentBatch || `${product.code}-0000`;

            // Extract suffix and increment
            const parts = previousBatch.split('-');
            let nextNum = 1;
            if (parts.length > 1) {
                const lastPart = parts[parts.length - 1];
                const parsed = parseInt(lastPart, 10);
                if (!isNaN(parsed)) {
                    nextNum = parsed + 1;
                }
            }

            const nextString = nextNum.toString().padStart(4, '0');
            const newBatch = `${product.code}-${nextString}`;

            newBatchList.push({
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                previousBatch: previousBatch,
                newBatch: newBatch,
            });

            product.currentBatch = newBatch;
            await saveProduct(product);
        }

        await saveBatchHistory({
            batches: newBatchList,
            type: "new",
        });

        setCurrentBatchData(newBatchList);
        setBatchTitle("New Batch List");
        setShowSelectModal(false);
        setSelectedIds([]);
        showNotification("New batches generated successfully!", "success");

        // refresh products to show new batches
        const prods = await loadProducts();
        setProducts(prods);
    }

    async function generateCurrentBatchList() {
        if (products.length === 0) {
            showNotification("No products found.", "warning");
            return;
        }

        const currentBatchList = products.map(product => ({
            productId: product.id,
            productName: product.name,
            productCode: product.code,
            currentBatch: product.currentBatch,
            newBatch: product.currentBatch,
        }));

        setCurrentBatchData(currentBatchList);
        setBatchTitle("Current Batch List");
    }

    // --- PDF Export ---
    async function handlePdfSettingsSubmit(e) {
        e.preventDefault();
        await savePdfSettings(pdfSettings);
        setShowPdfModal(false);
    }

    async function generatePDF() {
        if (!currentBatchData || currentBatchData.length === 0) {
            showNotification("No batch data available for export", "warning");
            return;
        }

        try {
            await exportBatchListToPdf(currentBatchData, pdfSettings.title);
            showNotification("PDF exported successfully", "success");
        } catch (err) {
            showNotification("Error exporting PDF", "error");
        }
    }

    return (
        <div className="tab-content active" id="new-batch">
            <h1 className="section-title">Generate New Batch List</h1>

            <div className="card">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
                    Click the button below to generate new batch numbers for selected products.
                    Each product's batch number will be updated with the current date.
                </p>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn btn-success" onClick={() => setShowSelectModal(true)}>
                        <span className="material-symbols-outlined">play_arrow</span>
                        Generate New Batch
                    </button>

                    <button className="btn btn-warning" onClick={generateCurrentBatchList}>
                        <span className="material-symbols-outlined">list</span>
                        Generate Current Batch List
                    </button>

                    {currentBatchData && (
                        <button className="btn btn-secondary" onClick={generatePDF}>
                            <span className="material-symbols-outlined">picture_as_pdf</span>
                            Export as PDF
                        </button>
                    )}

                    <button className="btn btn-primary" onClick={() => setShowPdfModal(true)}>
                        <span className="material-symbols-outlined">tune</span>
                        Customize PDF
                    </button>
                </div>
            </div>

            {currentBatchData && (
                <div id="batchListContainer">
                    <h2 className="section-title">{batchTitle}</h2>
                    <div className="batch-list">
                        {currentBatchData.map((item, idx) => (
                            <div key={item.productId + idx} className="batch-card" style={{ marginBottom: '20px' }}>
                                <div className="batch-header">
                                    <div className="batch-product-name">{item.productName}</div>
                                    <div style={{ fontWeight: 600, color: item.previousBatch ? 'var(--success)' : 'var(--primary)' }}>
                                        {item.previousBatch ? 'NEW' : 'CURRENT'}
                                    </div>
                                </div>
                                <div className="batch-numbers">
                                    {item.previousBatch ? (
                                        <>
                                            <div className="batch-number-item">
                                                <span className="batch-label">Previous Batch:</span>
                                                <span className="batch-value" style={{ color: 'var(--text-secondary)' }}>{item.previousBatch}</span>
                                            </div>
                                            <div className="batch-number-item">
                                                <span className="batch-label">New Batch:</span>
                                                <span className="batch-value" style={{ color: 'var(--success)' }}>{item.newBatch}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="batch-number-item">
                                                <span className="batch-label">Product Code:</span>
                                                <span className="batch-value" style={{ color: 'var(--text-secondary)' }}>{item.productCode}</span>
                                            </div>
                                            <div className="batch-number-item">
                                                <span className="batch-label">Current Batch:</span>
                                                <span className="batch-value">{item.currentBatch}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Product Selection Modal */}
            {showSelectModal && (
                <div className="modal active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Select Products for Batch</h2>
                            <button className="modal-close" onClick={() => setShowSelectModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="search-container">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="select-all-container">
                            <label>
                                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                                <span>Select All</span>
                            </label>
                            <span className="product-count">{filteredForSelect.length} products</span>
                        </div>

                        <div className="product-select-list">
                            {filteredForSelect.map(p => (
                                <div key={p.id} className={`product-select-item ${selectedIds.includes(p.id) ? 'selected' : ''}`} onClick={() => toggleProduct(p.id)}>
                                    <input type="checkbox" checked={selectedIds.includes(p.id)} readOnly />
                                    <div className="product-select-info">
                                        <div className="product-select-name">{p.name}</div>
                                        <div className="product-select-code">{p.code} - Current: {p.currentBatch}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                            <button className="btn btn-success" onClick={generateNewBatchList}>
                                <span className="material-symbols-outlined">play_arrow</span> Generate
                            </button>
                            <button className="btn" onClick={() => setShowSelectModal(false)} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PDF Modal */}
            {showPdfModal && (
                <div className="modal active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Customize PDF Export</h2>
                            <button className="modal-close" onClick={() => setShowPdfModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handlePdfSettingsSubmit}>
                            <div className="form-group">
                                <label className="form-label">PDF Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={pdfSettings.title}
                                    onChange={e => setPdfSettings({ ...pdfSettings, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Include Date</label>
                                <select
                                    className="form-control"
                                    value={pdfSettings.includeDate ? "yes" : "no"}
                                    onChange={e => setPdfSettings({ ...pdfSettings, includeDate: e.target.value === 'yes' })}
                                >
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Columns to Include</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" checked={pdfSettings.includeProductName} onChange={e => setPdfSettings({ ...pdfSettings, includeProductName: e.target.checked })} />
                                        <span>Product Name</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" checked={pdfSettings.includeProductCode} onChange={e => setPdfSettings({ ...pdfSettings, includeProductCode: e.target.checked })} />
                                        <span>Product Code</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" checked={pdfSettings.includePreviousBatch} onChange={e => setPdfSettings({ ...pdfSettings, includePreviousBatch: e.target.checked })} />
                                        <span>Previous Batch Number</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input type="checkbox" checked={pdfSettings.includeNewBatch} onChange={e => setPdfSettings({ ...pdfSettings, includeNewBatch: e.target.checked })} />
                                        <span>New Batch Number</span>
                                    </label>
                                </div>
                            </div>

                            <div className="form-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                                <button type="submit" className="btn btn-primary">
                                    <span className="material-symbols-outlined">save</span> Save Changes
                                </button>
                                <button type="button" className="btn" onClick={() => setShowPdfModal(false)} style={{ border: '1px solid var(--border-color)', background: 'transparent' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

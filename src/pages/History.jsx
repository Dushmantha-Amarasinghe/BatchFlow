import React, { useState, useEffect } from 'react';
import { loadAllBatchHistory } from '../services/db';
import { exportBatchListToPdf } from '../utils/pdfExport';
import { exportPrintSheet } from '../utils/exportPrintSheet';
import { useNotification } from '../contexts/NotificationContext';
import QRCode from 'qrcode';

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [exporting, setExporting] = useState('');
    const { showNotification } = useNotification();

    useEffect(() => {
        loadAllBatchHistory()
            .then(data => setHistory(data))
            .catch(() => showNotification('Error loading history', 'error'))
            .finally(() => setLoading(false));
    }, []);

    function formatDate(ts) {
        if (!ts) return '—';
        if (ts.toDate) return ts.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return new Date(ts).toLocaleDateString();
    }

    function matchesSearch(entry) {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        if (entry.materials?.toLowerCase().includes(term)) return true;
        return entry.batches?.some(b =>
            b.productName?.toLowerCase().includes(term) ||
            b.productCode?.toLowerCase().includes(term) ||
            b.newBatch?.toLowerCase().includes(term) ||
            b.currentBatch?.toLowerCase().includes(term)
        );
    }

    const filtered = history.filter(e =>
        (typeFilter === 'all' || e.type === typeFilter) && matchesSearch(e)
    );

    async function generateMediaForEntry(entry) {
        const batchList = entry.batches || [];
        const qrs = {};
        await Promise.all(batchList.map(async item => {
            const code = item.newBatch || item.currentBatch;
            if (!code) return;
            try {
                qrs[code] = await QRCode.toDataURL(code, {
                    width: 256, margin: 2, errorCorrectionLevel: 'H',
                    color: { dark: '#000000', light: '#ffffff' },
                });
            } catch { /* skip */ }
        }));
        return qrs;
    }

    async function handleExportPdf(entry) {
        setExporting(entry.id + '_pdf');
        try {
            const qrs = await generateMediaForEntry(entry);
            const mappedBatches = (entry.batches || []).map(b => ({
                ...b,
                newBatch: b.newBatch || b.currentBatch,
            }));
            await exportBatchListToPdf(mappedBatches, { title: 'Historical Batch List', includeQrCode: true }, qrs);
            showNotification('PDF exported', 'success');
        } catch { showNotification('Error exporting PDF', 'error'); }
        finally { setExporting(''); }
    }

    async function handleExportPrint(entry, type) {
        setExporting(entry.id + '_' + type);
        try {
            const mappedBatches = (entry.batches || []).map(b => ({
                ...b,
                newBatch: b.newBatch || b.currentBatch,
            }));
            await exportPrintSheet(mappedBatches, type, { perRow: 4, showLabel: true });
            showNotification(`${type === 'qr' ? 'QR' : 'Barcode'} sheet exported`, 'success');
        } catch { showNotification('Error exporting print sheet', 'error'); }
        finally { setExporting(''); }
    }

    return (
        <div className="tab-content active" id="history">
            <div className="page-header">
                <h1 className="page-title">Batch History</h1>
                <p className="page-subtitle">Browse, search, and export all your past batch runs.</p>
            </div>

            {/* Search & Filter */}
            <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <div className="search-container">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Search products, codes, batch numbers…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="history-filters" style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {['all', 'new', 'current'].map(f => (
                        <button key={f} className={`history-filter-chip${typeFilter === f ? ' active' : ''}`} onClick={() => setTypeFilter(f)}>
                            {f === 'all' ? '📋 All' : f === 'new' ? '🆕 New Batches' : '📍 Current Lists'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <div className="loading" style={{ margin: '0 auto 16px' }} />
                    Loading history…
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', display: 'block', marginBottom: '12px', opacity: 0.4 }}>history</span>
                    {searchTerm ? 'No batches match your search.' : 'No batch history yet.'}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filtered.map(entry => {
                        const isExpanded = expandedId === entry.id;
                        const batchCount = entry.batches?.length ?? 0;
                        return (
                            <div key={entry.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                {/* Header row */}
                                <div
                                    style={{ padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                            <span className={`batch-type-badge ${entry.type === 'new' ? 'new' : 'current'}`}>
                                                {entry.type === 'new' ? 'New Batch Run' : 'Current List'}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(entry.date)}</span>
                                        </div>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            {batchCount} product{batchCount !== 1 ? 's' : ''}
                                            {entry.batches?.[0]?.productName && ` · ${entry.batches[0].productName}${batchCount > 1 ? ` +${batchCount - 1} more` : ''}`}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        {/* Export buttons */}
                                        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={e => { e.stopPropagation(); handleExportPdf(entry); }} disabled={!!exporting}>
                                            {exporting === entry.id + '_pdf' ? <div className="loading" style={{ width: '14px', height: '14px' }} /> : <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>picture_as_pdf</span>}
                                            <span className="hide-on-mobile">PDF</span>
                                        </button>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#a78bfa' }} onClick={e => { e.stopPropagation(); handleExportPrint(entry, 'qr'); }} disabled={!!exporting}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>qr_code_2</span>
                                            <span className="hide-on-mobile">QRs</span>
                                        </button>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#60a5fa' }} onClick={e => { e.stopPropagation(); handleExportPrint(entry, 'barcode'); }} disabled={!!exporting}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>barcode</span>
                                            <span className="hide-on-mobile">Barcodes</span>
                                        </button>
                                        <button className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }} onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>expand_more</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded body */}
                                {isExpanded && (
                                    <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 20px', background: 'rgba(0,0,0,0.2)' }}>
                                        {entry.materials && (
                                            <div className="info-box info" style={{ marginBottom: '16px', fontSize: '0.82rem' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '1rem', flexShrink: 0 }}>biotech</span>
                                                <div><strong>Materials Used:</strong> {entry.materials}</div>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {entry.batches?.map((b, i) => {
                                                const batchCode = b.newBatch || b.currentBatch;
                                                return (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{b.productName}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.productCode}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                                            {b.previousBatch && (
                                                                <div style={{ textAlign: 'center' }}>
                                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Previous</div>
                                                                    <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{b.previousBatch}</div>
                                                                </div>
                                                            )}
                                                            <div style={{ textAlign: 'center' }}>
                                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Batch</div>
                                                                <div style={{ fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 700, color: '#a78bfa' }}>{batchCode}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

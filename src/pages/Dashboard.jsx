import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProducts, loadBatchHistory } from '../services/db';
import { formatDate } from '../utils/formatters';
import { exportBatchListToPdf } from '../utils/pdfExport';
import { useNotification } from '../contexts/NotificationContext';

function AnimatedCounter({ target, duration = 1200 }) {
    const [count, setCount] = useState(0);
    const raf = useRef(null);

    useEffect(() => {
        const num = typeof target === 'number' ? target : 0;
        if (num === 0) return;
        const startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * num));
            if (progress < 1) raf.current = requestAnimationFrame(animate);
        };
        raf.current = requestAnimationFrame(animate);
        return () => raf.current && cancelAnimationFrame(raf.current);
    }, [target, duration]);

    return <>{count}</>;
}

export default function Dashboard() {
    const [stats, setStats] = useState({ products: 0, batchLists: 0, lastDate: '—' });
    const [recentBatches, setRecentBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const [products, history] = await Promise.all([loadProducts(), loadBatchHistory()]);
                setStats({
                    products: products.length,
                    batchLists: history.length,
                    lastDate: history.length > 0 ? formatDate(history[0].date, true) : '—',
                });
                setRecentBatches(history.slice(0, 6));
            } catch (error) {
                console.error('Error loading dashboard data', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleBatchClick = (batch) => {
        setSelectedBatch(batch);
        setShowBatchModal(true);
    };

    const handleExportPdf = async () => {
        if (!selectedBatch?.batches) { showNotification('No batch data available', 'warning'); return; }
        try {
            await exportBatchListToPdf(selectedBatch.batches, `Batch List - ${formatDate(selectedBatch.date, true)}`);
            showNotification('PDF exported successfully', 'success');
        } catch (err) {
            showNotification('Error exporting PDF', 'error');
        }
    };

    const statsData = [
        { icon: 'inventory_2', label: 'Total Products', value: stats.products, isNum: true },
        { icon: 'generating_tokens', label: 'Batch Lists', value: stats.batchLists, isNum: true },
        { icon: 'schedule', label: 'Last Batch', value: stats.lastDate, isNum: false },
    ];

    const quickActions = [
        { icon: 'add_circle', iconClass: 'purple', title: 'Add New Product', desc: 'Register a product with a unique code and batch pattern.', label: 'Add Product', path: '/add-product', variant: 'btn-primary' },
        { icon: 'inventory_2', iconClass: 'blue', title: 'View Product List', desc: 'Browse, search, and manage your entire product catalogue.', label: 'View Products', path: '/product-list', variant: 'btn-secondary' },
        { icon: 'generating_tokens', iconClass: 'green', title: 'Generate Batch', desc: 'Create new batch numbers for selected products in one click.', label: 'Generate Batch', path: '/new-batch', variant: 'btn-success' },
        { icon: 'history', iconClass: 'amber', title: 'Batch History', desc: 'View and search your complete batch generation history.', label: 'View History', path: '/history', variant: 'btn-warning' },
    ];

    return (
        <div className="tab-content active" id="dashboard">
            {/* Page header */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your batch management activity.</p>
            </div>

            {/* Stats */}
            <div className="stats-container">
                {statsData.map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon">
                            <span className="material-symbols-outlined">{s.icon}</span>
                        </div>
                        <div className="stat-value">
                            {!loading && s.isNum ? <AnimatedCounter target={s.value} /> : s.value}
                        </div>
                        <div className="stat-label" style={{ marginTop: '8px' }}>{s.label.toUpperCase()}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: '28px', background: 'transparent', border: 'none', padding: 0 }}>
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions">
                    {quickActions.map(a => (
                        <div key={a.path} className="action-card" onClick={() => navigate(a.path)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className={`action-icon ${a.iconClass}`}>
                                <span className="material-symbols-outlined">{a.icon}</span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{a.title}</h3>
                            <p style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.desc}</p>
                            <button className={`btn ${a.variant}`} style={{ width: '100%', marginTop: '16px', padding: '10px' }} tabIndex={-1}>
                                {a.label}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Batches */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Batch Lists</h2>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>open_in_new</span>
                        View All
                    </button>
                </div>

                {loading ? (
                    <div className="loading-center"><div className="loading loading-lg" /></div>
                ) : recentBatches.length === 0 ? (
                    <div className="empty-state">
                        <span className="material-symbols-outlined empty-icon">inventory_2</span>
                        <h3 style={{ color: 'var(--text-secondary)' }}>No batch lists yet</h3>
                        <p style={{ fontSize: '0.9rem' }}>Generate your first batch list to see it here.</p>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: '16px' }} onClick={() => navigate('/new-batch')}>Generate Now</button>
                    </div>
                ) : (
                    <div className="recent-batches-list">
                        {recentBatches.map(batch => (
                            <div key={batch.id} className="batch-card" onClick={() => handleBatchClick(batch)} style={{ padding: '20px' }}>
                                <div className="batch-header" style={{ marginBottom: '12px' }}>
                                    <div className="batch-product-name" style={{ fontSize: '0.95rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle', marginRight: '6px', color: 'var(--text-muted)' }}>list_alt</span>
                                        Batch List
                                    </div>
                                    <span className={`batch-type-badge ${batch.type === 'new' ? 'new' : 'current'}`}>
                                        {batch.type === 'new' ? 'NEW' : 'CURRENT'}
                                    </span>
                                </div>
                                <div className="batch-numbers" style={{ gap: '8px' }}>
                                    <div className="batch-number-item" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                        <span className="batch-label" style={{ fontSize: '0.75rem' }}>PRODUCTS</span>
                                        <span className="batch-value" style={{ color: '#3b82f6', fontSize: '0.9rem' }}>{batch.batches ? batch.batches.length : 0}</span>
                                    </div>
                                    <div className="batch-number-item" style={{ padding: '8px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                        <span className="batch-label" style={{ fontSize: '0.75rem' }}>GENERATED</span>
                                        <span style={{ fontFamily: "'Space Grotesk',monospace", fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatDate(batch.date, true)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Batch Detail Modal */}
            {showBatchModal && selectedBatch && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '1.1rem', color: '#a78bfa' }}>list_alt</span>
                                Batch List — {formatDate(selectedBatch.date, true)}
                            </h2>
                            <button className="modal-close" onClick={() => setShowBatchModal(false)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { label: 'Products', value: selectedBatch.batches?.length ?? 0, color: '#a78bfa' },
                                { label: 'Type', value: selectedBatch.type === 'new' ? 'New Batches' : 'Current', color: 'var(--success)' },
                                { label: 'Date', value: formatDate(selectedBatch.date), color: 'var(--text-primary)' },
                            ].map(m => (
                                <div key={m.label} style={{ textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{m.label}</div>
                                    <div style={{ fontWeight: 700, color: m.color, fontFamily: "'Space Grotesk',sans-serif" }}>{m.value}</div>
                                </div>
                            ))}
                        </div>

                        {selectedBatch.materials && (
                            <div className="info-box info" style={{ marginBottom: '16px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem', flexShrink: 0 }}>biotech</span>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.8rem' }}>Materials Used</div>
                                    <div style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>{selectedBatch.materials}</div>
                                </div>
                            </div>
                        )}

                        <button className="btn btn-primary" onClick={handleExportPdf} style={{ width: '100%', marginBottom: '20px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>picture_as_pdf</span>
                            Export as PDF
                        </button>

                        <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                            {selectedBatch.batches?.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '12px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                                        <strong style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{item.productName}</strong>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.productCode}</span>
                                    </div>
                                    {selectedBatch.type === 'new' && item.previousBatch ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '3px' }}>Previous</div>
                                                <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.previousBatch}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--success)', textTransform: 'uppercase', marginBottom: '3px' }}>New</div>
                                                <div style={{ fontFamily: 'monospace', color: 'var(--success)', fontWeight: 700 }}>{item.newBatch}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '3px' }}>Current Batch</div>
                                            <div style={{ fontFamily: 'monospace', color: '#a78bfa', fontWeight: 700 }}>{item.newBatch || item.currentBatch}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

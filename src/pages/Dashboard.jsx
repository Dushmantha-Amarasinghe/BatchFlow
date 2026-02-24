import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadProducts, loadBatchHistory } from '../services/db';
import { formatDate } from '../utils/formatters';
import { exportBatchListToPdf } from '../utils/pdfExport';
import { useNotification } from '../contexts/NotificationContext';

export default function Dashboard() {
    const [stats, setStats] = useState({ products: 0, batchLists: 0, lastDate: '-' });
    const [recentBatches, setRecentBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const [products, history] = await Promise.all([
                    loadProducts(),
                    loadBatchHistory(),
                ]);

                setStats({
                    products: products.length,
                    batchLists: history.length,
                    lastDate: history.length > 0 ? formatDate(history[0].date, true) : '-'
                });

                setRecentBatches(history.slice(0, 6));
            } catch (error) {
                console.error("Error loading dashboard data", error);
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
        if (!selectedBatch || !selectedBatch.batches) {
            showNotification("No batch data available", "warning");
            return;
        }

        try {
            await exportBatchListToPdf(selectedBatch.batches, `Batch List - ${formatDate(selectedBatch.date, true)}`);
            showNotification("PDF exported successfully", "success");
        } catch (err) {
            console.error(err);
            showNotification("Error exporting PDF", "error");
        }
    };

    return (
        <div className="tab-content active" id="dashboard">
            <h1 className="section-title">Dashboard Overview</h1>

            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-label">Total Products</div>
                    <div className="stat-value">{stats.products}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Batch Lists Generated</div>
                    <div className="stat-value">{stats.batchLists}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Last Batch Date</div>
                    <div className="stat-value">{stats.lastDate}</div>
                </div>
            </div>

            <div className="card">
                <h2 className="section-title">Quick Actions</h2>

                <div className="quick-actions">
                    <div className="action-card">
                        <h3>Add New Product</h3>
                        <p>Add a new item to your product database with batch code pattern.</p>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            onClick={() => navigate('/add-product')}
                        >
                            <span className="material-symbols-outlined">add</span>
                            Add Product
                        </button>
                    </div>

                    <div className="action-card">
                        <h3>View Product List</h3>
                        <p>Browse and manage all existing products and their batch numbers.</p>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                            onClick={() => navigate('/product-list')}
                        >
                            <span className="material-symbols-outlined">list</span>
                            View Products
                        </button>
                    </div>

                    <div className="action-card">
                        <h3>Generate New Batch</h3>
                        <p>Create a new list of batch numbers for selected products.</p>
                        <button
                            className="btn btn-success"
                            style={{ width: '100%' }}
                            onClick={() => navigate('/new-batch')}
                        >
                            <span className="material-symbols-outlined">play_arrow</span>
                            Generate Batches
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2 className="section-title">Recent Batch Lists</h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loading"></div>
                    </div>
                ) : recentBatches.length === 0 ? (
                    <div id="recentBatchLists" className="empty-state">
                        <span className="material-symbols-outlined empty-icon">inventory_2</span>
                        <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>
                            No batch lists generated yet
                        </h3>
                        <p>Generate your first batch list to see them here.</p>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {recentBatches.map(batch => (
                                <div key={batch.id} className="batch-card" style={{ marginBottom: 0 }} onClick={() => handleBatchClick(batch)}>
                                    <div className="batch-header">
                                        <div className="batch-product-name">Batch List</div>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                            {batch.batches ? batch.batches.length : 0} Products
                                        </div>
                                    </div>
                                    <div className="batch-numbers">
                                        <div className="batch-number-item">
                                            <span className="batch-label">Generated:</span>
                                            <span className="batch-value">{formatDate(batch.date, true)}</span>
                                        </div>
                                        <div className="batch-number-item">
                                            <span className="batch-label">Type:</span>
                                            <span className="batch-value">
                                                {batch.type === "new" ? "New Batches" : "Current Batches"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Batch List Detail Modal */}
            {showBatchModal && selectedBatch && (
                <div className="modal active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Batch List - {formatDate(selectedBatch.date, true)}</h2>
                            <button className="modal-close" onClick={() => setShowBatchModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--light-bg)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
                                <div>
                                    <strong>Products:</strong><br />
                                    <span style={{ color: 'var(--primary)' }}>{selectedBatch.batches ? selectedBatch.batches.length : 0}</span>
                                </div>
                                <div>
                                    <strong>Type:</strong><br />
                                    <span style={{ color: 'var(--success)' }}>{selectedBatch.type === "new" ? "New Batches" : "Current Batches"}</span>
                                </div>
                                <div>
                                    <strong>Date:</strong><br />
                                    <span>{formatDate(selectedBatch.date)}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <button className="btn btn-primary" onClick={handleExportPdf} style={{ width: 'auto' }}>
                                <span className="material-symbols-outlined">picture_as_pdf</span>
                                Export as PDF
                            </button>
                        </div>

                        <h4 style={{ marginBottom: '15px' }}>Batch Details</h4>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                            {selectedBatch.batches && selectedBatch.batches.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: '15px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                        <strong>{item.productName}</strong>
                                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{item.productCode}</span>
                                    </div>

                                    {selectedBatch.type === "new" && item.previousBatch ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div>
                                                <strong>Previous:</strong><br />
                                                <span style={{ color: 'var(--text-secondary)' }}>{item.previousBatch}</span>
                                            </div>
                                            <div>
                                                <strong>New:</strong><br />
                                                <span style={{ color: 'var(--success)' }}>{item.newBatch}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <strong>Current Batch:</strong><br />
                                            <span style={{ color: 'var(--primary)' }}>{item.newBatch || item.currentBatch}</span>
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

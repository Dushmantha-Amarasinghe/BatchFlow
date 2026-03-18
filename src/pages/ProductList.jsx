import React, { useState, useEffect } from 'react';
import { loadProducts, loadCategories, deleteProduct, saveProduct, loadProductBatches } from '../services/db';
import { formatDate } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';
import CustomSelect from '../components/CustomSelect';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const { showNotification } = useNotification();
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [productBatches, setProductBatches] = useState([]);
    const [batchesLoading, setBatchesLoading] = useState(false);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        try {
            const [prods, cats] = await Promise.all([loadProducts(), loadCategories()]);
            setProducts(prods);
            setCategories(cats);
        } catch (err) { console.error('Failed to fetch products/categories', err); }
        finally { setLoading(false); }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this product? This cannot be undone.')) return;
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        showNotification('Product deleted', 'success');
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        try {
            const saved = await saveProduct(editingProduct);
            setProducts(products.map(p => p.id === saved.id ? saved : p));
            setEditingProduct(null);
            showNotification('Product updated', 'success');
        } catch { showNotification('Error saving product', 'error'); }
    }

    async function handleViewDetails(product) {
        setViewingProduct(product);
        setProductBatches([]);
        setBatchesLoading(true);
        try {
            const batches = await loadProductBatches(product.id);
            setProductBatches(batches);
        } catch (err) { console.error(err); }
        finally { setBatchesLoading(false); }
    }

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase());
        return matchSearch && (filterCategory ? p.categoryId === filterCategory : true);
    });

    const filterCategoryOptions = [
        { value: '', label: 'All Categories' },
        ...categories.map(c => ({ value: c.id, label: c.name }))
    ];

    const editCategoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

    return (
        <div className="tab-content active" id="product-list">
            <div className="page-header">
                <h1 className="page-title">Product List</h1>
                <p className="page-subtitle">{products.length} product{products.length !== 1 ? 's' : ''} registered</p>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div className="search-container" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
                    <span className="material-symbols-outlined">search</span>
                    <input
                        type="text"
                        placeholder="Search by name or code…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
                        </button>
                    )}
                </div>
                <div style={{ width: '220px' }}>
                    <CustomSelect
                        options={filterCategoryOptions}
                        value={filterCategory}
                        onChange={setFilterCategory}
                    />
                </div>
                {(searchTerm || filterCategory) && (
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSearchTerm(''); setFilterCategory(''); }}>
                        Clear filters
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-center"><div className="loading loading-lg" /></div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <span className="material-symbols-outlined empty-icon">inventory_2</span>
                    <h3 style={{ color: 'var(--text-secondary)' }}>{products.length === 0 ? 'No products yet' : 'No products match'}</h3>
                    <p style={{ fontSize: '0.9rem' }}>
                        {products.length === 0 ? 'Add your first product to get started.' : 'Try adjusting your search or filters.'}
                    </p>
                </div>
            ) : (
                <div className="product-list">
                    {filteredProducts.map(product => {
                        const cat = categories.find(c => c.id === product.categoryId);
                        return (
                            <div key={product.id} className="product-card" onClick={e => {
                                if (!e.target.closest('.product-actions')) handleViewDetails(product);
                            }}>
                                {cat && (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        {cat.name}
                                    </div>
                                )}
                                <div className="product-name">{product.name}</div>
                                <div className="product-code">{product.code}</div>
                                <div className="current-batch-badge">
                                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>qr_code</span>
                                    {product.currentBatch}
                                </div>
                                <div className="product-details">
                                    Last updated {formatDate(product.lastUpdated)}
                                </div>
                                <div className="product-actions">
                                    <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); setEditingProduct(product); }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>edit</span>
                                        Edit
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(product.id); }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>delete</span>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View Product Batch History Modal */}
            {viewingProduct && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '8px', color: '#a78bfa' }}>history</span>
                                {viewingProduct.name}
                            </h2>
                            <button className="modal-close" onClick={() => setViewingProduct(null)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
                            {[
                                { label: 'Code', value: viewingProduct.code, color: '#a78bfa' },
                                { label: 'Category', value: categories.find(c => c.id === viewingProduct.categoryId)?.name || 'N/A', color: 'var(--text-primary)' },
                                { label: 'Current Batch', value: viewingProduct.currentBatch, color: 'var(--success)' },
                            ].map(m => (
                                <div key={m.label} style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{m.label}</div>
                                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: m.color, fontSize: '0.85rem' }}>{m.value}</div>
                                </div>
                            ))}
                        </div>

                        <h4 style={{ marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Batch History</h4>
                        {batchesLoading ? (
                            <div className="loading-center"><div className="loading" /></div>
                        ) : productBatches.length === 0 ? (
                            <div className="empty-state" style={{ padding: '32px' }}>
                                <span className="material-symbols-outlined empty-icon">history</span>
                                <p>No batch history for this product.</p>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                {productBatches.map(batch => (
                                    <div key={batch.id} style={{ marginBottom: '10px', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                                            <strong style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.85rem' }}>{formatDate(batch.date, true)}</strong>
                                            <span style={{ padding: '3px 8px', background: 'rgba(124,58,237,0.12)', color: '#a78bfa', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700 }}>Generated</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Previous</div>
                                                <div style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>{batch.previousBatch || '—'}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--success)', textTransform: 'uppercase', marginBottom: '2px' }}>New</div>
                                                <div style={{ fontFamily: 'monospace', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>{batch.newBatch}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
                <div className="modal">
                    <div className="modal-content" style={{ maxWidth: '480px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '8px', color: '#a78bfa' }}>edit</span>
                                Edit Product
                            </h2>
                            <button className="modal-close" onClick={() => setEditingProduct(null)}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input type="text" className="form-control" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Product Code</label>
                                <input type="text" className="form-control" value={editingProduct.code} onChange={e => setEditingProduct({ ...editingProduct, code: e.target.value.toUpperCase() })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <CustomSelect
                                    options={editCategoryOptions}
                                    value={editingProduct.categoryId}
                                    onChange={val => setEditingProduct({ ...editingProduct, categoryId: val })}
                                    placeholder="Select category…"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Current Batch Number</label>
                                <input type="text" className="form-control" value={editingProduct.currentBatch} onChange={e => setEditingProduct({ ...editingProduct, currentBatch: e.target.value })} required />
                                <div className="form-hint">Edit only if you need to manually correct the batch number.</div>
                            </div>
                            <div className="form-buttons">
                                <button type="button" className="btn btn-ghost" onClick={() => setEditingProduct(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

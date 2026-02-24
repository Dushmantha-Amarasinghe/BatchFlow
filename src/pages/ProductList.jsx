import React, { useState, useEffect } from 'react';
import { loadProducts, loadCategories, deleteProduct, saveProduct, loadProductBatches } from '../services/db';
import { formatDate } from '../utils/formatters';
import { useNotification } from '../contexts/NotificationContext';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const { showNotification } = useNotification();

    // Modals state
    const [editingProduct, setEditingProduct] = useState(null);
    const [viewingProduct, setViewingProduct] = useState(null);
    const [productBatches, setProductBatches] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [prods, cats] = await Promise.all([
                loadProducts(),
                loadCategories()
            ]);
            setProducts(prods);
            setCategories(cats);
        } catch (err) {
            console.error("Failed to fetch products/categories", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        if (window.confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
            showNotification("Product deleted successfully", "success");
        }
    }

    async function handleEditSubmit(e) {
        e.preventDefault();
        try {
            const saved = await saveProduct(editingProduct);
            setProducts(products.map(p => p.id === saved.id ? saved : p));
            setEditingProduct(null);
            showNotification("Product updated successfully", "success");
        } catch (err) {
            showNotification("Error saving product.", "error");
        }
    }

    async function handleViewDetails(product) {
        setViewingProduct(product);
        try {
            const batches = await loadProductBatches(product.id);
            setProductBatches(batches);
        } catch (err) {
            console.error(err);
        }
    }

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory ? p.categoryId === filterCategory : true;
        return matchSearch && matchCat;
    });

    return (
        <div className="tab-content active" id="product-list">
            <h1 className="section-title">Product List</h1>

            <div className="filter-bar">
                <div className="filter-controls">
                    <div className="filter-group">
                        <div className="filter-row">
                            <div>
                                <label className="form-label" style={{ marginBottom: '8px' }}>Search Products</label>
                                <div className="search-container" style={{ marginBottom: 0 }}>
                                    <span className="material-symbols-outlined">search</span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name or code..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="form-label" style={{ marginBottom: '8px' }}>Filter by Category</label>
                                <select
                                    className="form-control"
                                    value={filterCategory}
                                    onChange={e => setFilterCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: 'auto' }}
                        onClick={() => { setSearchTerm(''); setFilterCategory(''); }}
                    >
                        <span className="material-symbols-outlined">filter_alt_off</span>
                        Clear
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading"></div></div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <span className="material-symbols-outlined empty-icon">inventory_2</span>
                    <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>No products found</h3>
                    <p>Try adjusting your search or add a new product.</p>
                </div>
            ) : (
                <div className="product-list">
                    {filteredProducts.map(product => {
                        const cat = categories.find(c => c.id === product.categoryId);
                        return (
                            <div key={product.id} className="product-card" onClick={(e) => {
                                if (!e.target.closest('.product-actions')) {
                                    handleViewDetails(product);
                                }
                            }}>
                                {cat && <div className="category-badge">{cat.name}</div>}
                                <div className="product-name">{product.name}</div>
                                <div className="product-code">{product.code}</div>
                                <div className="product-details">
                                    <div>Current Batch: <strong>{product.currentBatch}</strong></div>
                                    <div>Last Updated: {formatDate(product.lastUpdated)}</div>
                                </div>
                                <div className="product-actions">
                                    <button className="btn btn-primary" onClick={() => setEditingProduct(product)}>
                                        <span className="material-symbols-outlined">edit</span> Edit
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>
                                        <span className="material-symbols-outlined">delete</span> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* View Product Modal */}
            {viewingProduct && (
                <div className="modal active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">{viewingProduct.name} - Batch History</h2>
                            <button className="modal-close" onClick={() => setViewingProduct(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'var(--light-bg)', borderRadius: '8px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                                <div>
                                    <strong>Product Code:</strong><br />
                                    <span style={{ color: 'var(--primary)' }}>{viewingProduct.code}</span>
                                </div>
                                <div>
                                    <strong>Category:</strong><br />
                                    <span style={{ color: 'var(--secondary)' }}>
                                        {categories.find(c => c.id === viewingProduct.categoryId)?.name || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <strong>Current Batch:</strong><br />
                                    <span style={{ color: 'var(--success)' }}>{viewingProduct.currentBatch}</span>
                                </div>
                            </div>
                        </div>

                        {productBatches.length === 0 ? (
                            <div className="empty-state" style={{ padding: '40px 20px' }}>
                                <span className="material-symbols-outlined empty-icon">history</span>
                                <h3 style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>No batch history found</h3>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{ marginBottom: '15px' }}>Batch History</h4>
                                {productBatches.map(batch => (
                                    <div key={batch.id} style={{ marginBottom: '15px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                                            <strong>{formatDate(batch.date, true)}</strong>
                                            <span style={{ padding: '4px 8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem' }}>Batch Generated</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div><strong>Previous:</strong><br /><span style={{ color: 'var(--text-secondary)' }}>{batch.previousBatch || "N/A"}</span></div>
                                            <div><strong>New:</strong><br /><span style={{ color: 'var(--success)' }}>{batch.newBatch}</span></div>
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
                <div className="modal active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Product</h2>
                            <button className="modal-close" onClick={() => setEditingProduct(null)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Product Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingProduct.code}
                                    onChange={e => setEditingProduct({ ...editingProduct, code: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-control"
                                    required
                                    value={editingProduct.categoryId}
                                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Current Batch Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingProduct.currentBatch}
                                    onChange={e => setEditingProduct({ ...editingProduct, currentBatch: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button type="submit" className="btn btn-primary">
                                    <span className="material-symbols-outlined">save</span>
                                    Update
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setEditingProduct(null)}
                                    style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                                >
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

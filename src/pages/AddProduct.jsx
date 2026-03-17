import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCategories, saveCategory, deleteCategory, saveProduct, loadProducts } from '../services/db';
import { useNotification } from '../contexts/NotificationContext';

export default function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [productName, setProductName] = useState('');
    const [productCode, setProductCode] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        try {
            const [cats, prods] = await Promise.all([loadCategories(), loadProducts()]);
            setCategories(cats);
            setProducts(prods);
        } catch (err) { console.error('Failed to load data', err); }
    }

    async function handleAddCategory() {
        if (!newCatName.trim()) { showNotification('Enter a category name', 'error'); return; }
        if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
            showNotification('Category already exists', 'error'); return;
        }
        try {
            const saved = await saveCategory(newCatName.trim());
            setCategories([...categories, saved]);
            setNewCatName('');
            showNotification('Category added', 'success');
        } catch { showNotification('Error saving category', 'error'); }
    }

    async function handleDeleteCategory(id) {
        if (!window.confirm('Delete this category?')) return;
        try {
            await deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
            if (categoryId === id) setCategoryId('');
            showNotification('Category removed', 'success');
        } catch { showNotification('Error deleting category', 'error'); }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!productName || !productCode || !categoryId) {
            showNotification('Please fill in all fields', 'error'); return;
        }
        const codeUpper = productCode.trim().toUpperCase();
        if (products.some(p => p.code === codeUpper)) {
            showNotification('Product code already exists', 'error'); return;
        }
        setIsSubmitting(true);
        try {
            await saveProduct({ name: productName.trim(), code: codeUpper, categoryId, currentBatch: `${codeUpper}-0000` });
            showNotification('Product added successfully!', 'success');
            setProductName(''); setProductCode(''); setCategoryId('');
            setTimeout(() => navigate('/product-list'), 1000);
        } catch { showNotification('Error adding product', 'error'); }
        finally { setIsSubmitting(false); }
    }

    const batchPreview = productCode
        ? `${productCode.trim().toUpperCase()}-0000`
        : 'CODE-0000';

    return (
        <div className="tab-content active" id="add-product">
            <div className="page-header">
                <h1 className="page-title">Add New Product</h1>
                <p className="page-subtitle">Register a product to start generating batch numbers.</p>
            </div>

            {/* Category Management */}
            <div className="card category-section">
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#a78bfa' }}>category</span>
                    Manage Categories
                </h3>
                <div className="category-input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="New category name…"
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button className="btn btn-secondary" onClick={handleAddCategory} style={{ flexShrink: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
                        Add
                    </button>
                </div>
                <div className="form-hint" style={{ marginBottom: '12px' }}>Categories help organise your product catalogue.</div>
                <div className="category-list">
                    {categories.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No categories yet. Add one above.</span>
                    ) : (
                        categories.map(cat => (
                            <span key={cat.id} className="category-tag">
                                {cat.name}
                                <span className="remove-category" onClick={() => handleDeleteCategory(cat.id)}>
                                    <span className="material-symbols-outlined">close</span>
                                </span>
                            </span>
                        ))
                    )}
                </div>
            </div>

            {/* Product Form */}
            <div className="card">
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#a78bfa' }}>add_box</span>
                    Product Details
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="productName">Product Name</label>
                        <input type="text" className="form-control" id="productName" placeholder="e.g., Air Freshener Apple" value={productName} onChange={e => setProductName(e.target.value)} required />
                        <div className="form-hint">Full display name of this product.</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="productCode">Product Code</label>
                        <input type="text" className="form-control" id="productCode" placeholder="e.g., AIRAP" value={productCode} onChange={e => setProductCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} required />
                        <div className="form-hint">Short uppercase prefix for the batch stem (letters &amp; numbers only).</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="productCategory">Category</label>
                        <select
                            className="form-control"
                            id="productCategory"
                            value={categoryId}
                            onChange={e => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Select a category…</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <div className="form-hint" style={{ color: 'var(--warning)' }}>Add a category above first.</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Initial Batch Preview</label>
                        <div className="batch-preview-box">
                            <span className="batch-preview-text">{batchPreview}</span>
                        </div>
                        <div className="form-hint">Starting batch number. Subsequent batches increment the suffix.</div>
                    </div>

                    <div className="form-buttons">
                        <button type="button" className="btn btn-ghost" onClick={() => { setProductName(''); setProductCode(''); setCategoryId(''); }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>restart_alt</span>
                            Reset
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !categoryId}>
                            {isSubmitting ? <div className="loading" /> : <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>}
                            {isSubmitting ? 'Saving…' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

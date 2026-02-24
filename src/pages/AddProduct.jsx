import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    loadCategories,
    saveCategory,
    deleteCategory,
    saveProduct,
    loadProducts
} from '../services/db';
import { useNotification } from '../contexts/NotificationContext';

export default function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [newCatName, setNewCatName] = useState('');

    const [productName, setProductName] = useState('');
    const [productCode, setProductCode] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const { showNotification } = useNotification();

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [cats, prods] = await Promise.all([
                loadCategories(),
                loadProducts()
            ]);
            setCategories(cats);
            setProducts(prods);
        } catch (err) {
            console.error("Failed to load initial data", err);
        }
    }

    async function handleAddCategory() {
        if (!newCatName.trim()) {
            showNotification("Please enter a category name", "error");
            return;
        }
        if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
            showNotification("Category already exists", "error");
            return;
        }

        try {
            const saved = await saveCategory(newCatName.trim());
            setCategories([...categories, saved]);
            setNewCatName('');
            showNotification("Category added successfully", "success");
        } catch (err) {
            showNotification("Error saving category", "error");
        }
    }

    async function handleDeleteCategory(id) {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id);
                setCategories(categories.filter(c => c.id !== id));
                if (categoryId === id) setCategoryId('');
                showNotification("Category deleted", "success");
            } catch (err) {
                showNotification("Error deleting category", "error");
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!productName || !productCode || !categoryId) {
            showNotification("Please fill in all fields", "error");
            return;
        }

        const codeUpper = productCode.trim().toUpperCase();
        if (products.some(p => p.code === codeUpper)) {
            showNotification("Product code already exists. Please use a different code.", "error");
            return;
        }

        try {
            const initialBatch = `${codeUpper}-0000`;
            const newProduct = {
                name: productName.trim(),
                code: codeUpper,
                categoryId: categoryId,
                currentBatch: initialBatch,
            };

            await saveProduct(newProduct);
            showNotification("Product added successfully", "success");

            // Reset form
            setProductName('');
            setProductCode('');
            setCategoryId('');

            // Navigate to product list after brief delay
            setTimeout(() => navigate('/product-list'), 1000);
        } catch (err) {
            showNotification("Error adding product", "error");
        }
    }

    const batchPreview = productCode
        ? `${productCode.trim().toUpperCase()}-0000`
        : "Enter product code to see preview";

    return (
        <div className="tab-content active" id="add-product">
            <h1 className="section-title">Add New Product</h1>

            <div className="card category-section">
                <h3>
                    <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>category</span>
                    Manage Categories
                </h3>
                <div className="category-input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter new category name"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddCategory} style={{ width: 'auto' }}>
                        <span className="material-symbols-outlined">add</span>
                        Add Category
                    </button>
                </div>
                <div className="form-hint">Add categories to organize your products better.</div>

                <div className="category-list">
                    {categories.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No categories added yet.</div>
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

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="productName">Product Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="productName"
                            placeholder="e.g., Air Freshener Apple"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                        />
                        <div className="form-hint">Enter the full name of the product.</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="productCode">Product Code (for batch)</label>
                        <input
                            type="text"
                            className="form-control"
                            id="productCode"
                            placeholder="e.g., AIRAP"
                            value={productCode}
                            onChange={(e) => setProductCode(e.target.value)}
                            required
                        />
                        <div className="form-hint">
                            This will be used as the prefix for batch numbers (uppercase letters only).
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="productCategory">Category</label>
                        <select
                            className="form-control"
                            id="productCategory"
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <div className="form-hint">Select the category this product belongs to.</div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Preview Batch Number</label>
                        <div style={{
                            padding: '12px',
                            backgroundColor: 'var(--light-bg)',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            color: 'var(--primary)',
                            textAlign: 'center'
                        }}>
                            {batchPreview}
                        </div>
                    </div>

                    <div className="form-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button type="submit" className="btn btn-primary">
                            <span className="material-symbols-outlined">save</span>
                            Add Product
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => {
                                setProductName('');
                                setProductCode('');
                                setCategoryId('');
                            }}
                            style={{
                                backgroundColor: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <span className="material-symbols-outlined">restart_alt</span>
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

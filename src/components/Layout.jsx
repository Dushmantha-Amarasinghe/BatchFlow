import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/dashboard',    icon: 'grid_view',         label: 'Dashboard' },
        { path: '/add-product',  icon: 'add_circle',        label: 'Add Product' },
        { path: '/new-batch',    icon: 'generating_tokens',  label: 'New Batch' },
        { path: '/product-list', icon: 'inventory_2',       label: 'Products' },
        { path: '/history',      icon: 'history',           label: 'History' },
        { path: '/settings',     icon: 'settings',          label: 'Settings' },
    ];

    function isActive(path) {
        return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    }

    return (
        <div className="app-layout">
            {/* ── Header ── */}
            <header className="app-header">
                <div className="nav-container">
                    <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <span className="material-symbols-outlined logo-icon">widgets</span>
                        BatchFlow
                    </div>

                    {/* Desktop pill tabs */}
                    <nav className="nav-tabs">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`tab-btn${isActive(item.path) ? ' active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.05rem' }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* User avatar + Sign out */}
                    <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {currentUser?.photoURL && (
                            <img
                                src={currentUser.photoURL}
                                alt="avatar"
                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid rgba(124,58,237,0.3)' }}
                                referrerPolicy="no-referrer"
                            />
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={logout}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>logout</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="app-main">
                <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
                    <Outlet />
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="app-footer" style={{
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(5,5,5,0.6)',
                backdropFilter: 'blur(8px)',
                padding: '20px 0',
            }}>
                <div className="container">
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            © {new Date().getFullYear()} BatchFlow · A product by{' '}
                            <a href="https://reforatech.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', fontWeight: 600 }}>
                                Refora Technologies
                            </a>
                            {' '}· Made with{' '}
                            <span style={{ color: '#ef4444', animation: 'heartbeat 2s ease infinite', display: 'inline-flex', alignItems: 'center' }}>❤</span>
                        </p>
                        <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#fbbf24', fontSize: '0.9rem' }}>💛</span>
                            <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.75rem' }}>Support the Developer</span>
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                            <Link to="/privacy-policy" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Privacy Policy</Link>
                            <a href="https://reforatech.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>reforatech.com</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── Mobile Bottom Nav (hidden on desktop) ── */}
            <nav className="mobile-nav">
                <div className="mobile-nav-inner">
                    {navItems.map(item => (
                        <button
                            key={item.path}
                            className={`mobile-nav-btn${isActive(item.path) ? ' active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}

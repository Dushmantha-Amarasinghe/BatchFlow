import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Layout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showSupportModal, setShowSupportModal] = React.useState(false);

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error("Failed to logout", err);
        }
    }

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('batchflow_theme', isDark ? 'dark' : 'light');

        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = isDark
                ? '<span class="material-symbols-outlined">light_mode</span>'
                : '<span class="material-symbols-outlined">dark_mode</span>';
        }
    };

    React.useEffect(() => {
        if (localStorage.getItem('batchflow_theme') === 'dark') {
            document.body.classList.add('dark-mode');
            const themeBtn = document.getElementById('themeToggleBtn');
            if (themeBtn) {
                themeBtn.innerHTML = '<span class="material-symbols-outlined">light_mode</span>';
            }
        }
    }, []);

    return (
        <>
            <header>
                <div className="container nav-container" style={{ height: '70px' }}>
                    <NavLink to="/dashboard" className="logo">
                        <span className="material-symbols-outlined logo-icon">widgets</span>
                        <span>BatchFlow</span>
                    </NavLink>

                    <div className="nav-tabs">
                        <NavLink to="/dashboard" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`} end>
                            <span className="material-symbols-outlined">dashboard</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/add-product" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">add_circle</span>
                            Add Product
                        </NavLink>
                        <NavLink to="/product-list" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">inventory_2</span>
                            Product List
                        </NavLink>
                        <NavLink to="/new-batch" className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
                            <span className="material-symbols-outlined">view_list</span>
                            New Batch List
                        </NavLink>
                    </div>

                    <div className="header-actions">
                        <button className="theme-toggle" id="themeToggleBtn" onClick={toggleTheme} title="Toggle Theme">
                            <span className="material-symbols-outlined">dark_mode</span>
                        </button>
                        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', marginLeft: '10px' }} title="Logout">
                            <LogOut size={18} />
                            <span style={{ marginLeft: '4px' }}>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-nav">
                <div className="mobile-nav-inner">
                    <NavLink to="/dashboard" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`} end>
                        <span className="material-symbols-outlined">dashboard</span>
                        <span className="nav-label">Dashboard</span>
                    </NavLink>
                    <NavLink to="/add-product" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">add_circle</span>
                        <span className="nav-label">Add</span>
                    </NavLink>
                    <NavLink to="/product-list" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="nav-label">Products</span>
                    </NavLink>
                    <NavLink to="/new-batch" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
                        <span className="material-symbols-outlined">view_list</span>
                        <span className="nav-label">Batch</span>
                    </NavLink>
                </div>
            </nav>

            <main className="container" style={{ paddingTop: '40px' }}>
                <Outlet />
            </main>

            <footer style={{ marginTop: '40px' }}>
                <div className="container">
                    <div className="footer-content">
                        <p style={{ marginBottom: '10px' }}>
                            © 2025 BatchFlow. A product by <strong>Refora Technologies</strong>.
                            Made with <span className="footer-heart">❤</span> for efficient batch management.
                        </p>
                        <p>
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowSupportModal(true); }} style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                                🤝 Support the Developer
                            </a>
                            <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.85rem' }}>
                                Help us keep bringing updates!
                            </span>
                        </p>
                    </div>
                </div>
            </footer>

            {/* Support Developer Modal */}
            {showSupportModal && (
                <div className="modal active">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">🤝 Support the Developer</h2>
                            <button className="modal-close" onClick={() => setShowSupportModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                Thank you for considering supporting BatchFlow! Our country currently doesn't support direct integration with platforms like PayPal or Stripe, so we are accepting direct bank transfers.
                            </p>
                        </div>

                        <div style={{ backgroundColor: 'var(--light-bg)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Bank Name</span>
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>People's Bank</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Branch</span>
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Delgoda</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Account Name</span>
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>DSB Amarasinghe</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Account Type</span>
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Saving Account</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary-light)', padding: '15px', borderRadius: '8px', marginTop: '5px' }}>
                                    <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Account Number</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>118200280035460</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
                            <button className="btn btn-primary" onClick={() => setShowSupportModal(false)} style={{ width: '100%' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

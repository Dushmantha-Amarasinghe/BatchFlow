import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // If already logged in, they can go straight to dashboard
    const handleGetStarted = () => {
        if (currentUser) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--light-bg)' }}>
            {/* Header */}
            <header style={{ backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow)', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="logo">
                        <span className="material-symbols-outlined logo-icon">widgets</span>
                        <span>BatchFlow</span>
                    </div>

                    <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Link to="/privacy-policy" className="hide-on-mobile" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
                        {currentUser ? (
                            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 20px' }}>Go to Dashboard</Link>
                        ) : (
                            <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px' }}>Log In</Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 className="hero-title">
                        Manage Your <span style={{ color: 'var(--primary)' }}>Batch Numbers</span> with Ease
                    </h1>
                    <p className="hero-subtitle">
                        BatchFlow is the ultimate tool for generating, tracking, and exporting your product batch codes. Fast, secure, and seamlessly integrated.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button onClick={handleGetStarted} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 40px', borderRadius: '30px' }}>
                            {currentUser ? "Continue to Dashboard" : "Get Started"}
                        </button>
                    </div>
                </div>

                {/* Features Highlight */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', maxWidth: '1000px', width: '100%', marginTop: '80px' }}>
                    <div className="card" style={{ padding: '30px', textAlign: 'center', border: 'none', backgroundColor: 'var(--card-bg)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '15px' }}>speed</span>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-primary)' }}>Fast Generation</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Automatically generate sequential batch numbers ending with just a single click.</p>
                    </div>
                    <div className="card" style={{ padding: '30px', textAlign: 'center', border: 'none', backgroundColor: 'var(--card-bg)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--success)', marginBottom: '15px' }}>inventory_2</span>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-primary)' }}>Product Tracking</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Maintain a clean and searchable history of every batch associated with your products.</p>
                    </div>
                    <div className="card" style={{ padding: '30px', textAlign: 'center', border: 'none', backgroundColor: 'var(--card-bg)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--secondary)', marginBottom: '15px' }}>picture_as_pdf</span>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--text-primary)' }}>PDF Export</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Easily export your new batch lists directly to PDF format for printing or archiving.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ backgroundColor: 'var(--card-bg)', padding: '40px 0 20px 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div className="container">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                        © {new Date().getFullYear()} BatchFlow. A product by <a href="https://reforatech.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Refora Technologies</a>.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
                        <span style={{ color: 'var(--border-color)' }}>|</span>
                        <Link to="/privacy-policy" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

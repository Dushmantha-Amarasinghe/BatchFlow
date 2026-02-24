import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--light-bg)' }}>
            <header style={{ backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow)', padding: '20px 0', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/" className="logo" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                        <span className="material-symbols-outlined logo-icon" style={{ fontSize: '1.8rem' }}>widgets</span>
                        <span>BatchFlow</span>
                    </Link>
                    <Link to="/" className="btn btn-secondary" style={{ padding: '8px 16px' }}>Back to Home</Link>
                </div>
            </header>

            <main className="container" style={{ padding: '60px 20px', flex: 1, maxWidth: '800px' }}>
                <div className="card" style={{ padding: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--text-primary)' }}>Privacy Policy</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <div style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>
                        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>1. Introduction</h2>
                        <p style={{ marginBottom: '15px' }}>
                            Welcome to BatchFlow, a service provided by Refora Technologies. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>2. Data We Collect</h2>
                        <p style={{ marginBottom: '15px' }}>
                            We only collect the data necessary to provide our services. By using Google Sign-In, we collect your basic profile information such as your email address and name. We also securely store the batch and product data you input into the application using Google Firestore.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>3. How We Use Your Data</h2>
                        <p style={{ marginBottom: '15px' }}>
                            Your data is used strictly to provide you with the functionality of the BatchFlow application, ensuring that only you have access to your saved products and batch configurations. We do not sell or share your data with third parties.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>4. Security</h2>
                        <p style={{ marginBottom: '15px' }}>
                            We use standard industry practices, including Firebase Authentication and Firestore Security Rules, to ensure your data remains secure and private.
                        </p>

                        <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px' }}>5. Contact Us</h2>
                        <p style={{ marginBottom: '15px' }}>
                            If you have any questions about this privacy policy or our privacy practices, please contact Refora Technologies.
                        </p>
                    </div>
                </div>
            </main>

            <footer style={{ backgroundColor: 'var(--card-bg)', padding: '30px 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div className="container">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        © {new Date().getFullYear()} BatchFlow. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

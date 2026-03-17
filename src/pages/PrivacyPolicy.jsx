import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function PrivacyPolicy() {
    useScrollAnimation('.scroll-animate');

    const sections = [
        {
            title: '1. Introduction',
            content: 'BatchFlow is a service by Refora Technologies. We respect your privacy and are committed to protecting your personal data. By using BatchFlow, you agree to the practices described in this policy.',
        },
        {
            title: '2. Data We Collect',
            content: 'We collect only the minimum data needed to provide our service. When you use Google Sign-In, we collect your name and email address. We also securely store the product and batch data you input, using Google Firebase Firestore.',
        },
        {
            title: '3. Third-Party Services',
            content: 'BatchFlow uses Google services (Firebase Authentication, Cloud Firestore). These services have their own privacy policies. We do not use advertising networks or analytics SDKs. No third party accesses your production data.',
            links: [{ label: 'Google Privacy Policy', href: 'https://policies.google.com/privacy' }],
        },
        {
            title: '4. How We Use Your Data',
            content: 'Your data is used exclusively to provide BatchFlow functionality — managing your products, batch numbers, and related settings. We do not sell, rent, or share your data with any third party for marketing purposes.',
        },
        {
            title: '5. Data Security',
            content: 'We use Firebase Authentication and Firestore Security Rules to ensure your data is private and only accessible by you. All data is encrypted in transit and at rest by Google Cloud infrastructure.',
        },
        {
            title: '6. Data Retention & Deletion',
            content: "Your data is kept for as long as you use the service. You can export all your data at any time from the Settings page. To request account deletion, contact us — we will remove all your data from our servers.",
        },
        {
            title: '7. Children\'s Privacy',
            content: 'BatchFlow is not intended for users under the age of 13. We do not knowingly collect personal information from children. If we discover such data has been collected, we will delete it immediately.',
        },
        {
            title: '8. Changes to This Policy',
            content: 'We may update this Privacy Policy from time to time. Changes will be posted on this page and are effective immediately upon posting.',
        },
        {
            title: '9. Contact Us',
            content: 'If you have any questions or concerns about this policy, please reach out to Refora Technologies.',
            links: [{ label: 'reforatech@gmail.com', href: 'mailto:reforatech@gmail.com' }],
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-900)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ borderBottom: '1px solid var(--glass-border)', backdropFilter: 'blur(16px)', background: 'rgba(10,10,10,0.85)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
                    <Link to="/" className="logo">
                        <span className="material-symbols-outlined logo-icon">widgets</span>
                        BatchFlow
                    </Link>
                    <Link to="/" className="btn btn-ghost btn-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main style={{ flex: 1, padding: '60px 0 80px' }}>
                <div className="container" style={{ maxWidth: '720px' }}>
                    {/* Page title */}
                    <div className="scroll-animate" style={{ marginBottom: '48px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '0.8rem' }}>shield</span>
                            Legal
                        </div>
                        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '3rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.03em' }}>Privacy Policy</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            BatchFlow by Refora Technologies &nbsp;·&nbsp; Effective as of March 2025
                        </p>
                    </div>

                    {/* Intro box */}
                    <div className="info-box info scroll-animate delay-1" style={{ marginBottom: '40px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', flexShrink: 0 }}>info</span>
                        <div>
                            Refora Technologies built BatchFlow as a free web service. This page informs you about our policies regarding the collection, use, and disclosure of personal information when you use our service.
                        </div>
                    </div>

                    {/* Sections */}
                    {sections.map((s, i) => (
                        <div key={s.title} className={`scroll-animate delay-${Math.min(i + 1, 6)}`} style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                {s.title}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.88rem' }}>{s.content}</p>
                            {s.links?.map(l => (
                                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a78bfa', fontWeight: 600, fontSize: '0.85rem', marginTop: '10px', textDecoration: 'underline', textDecorationColor: 'rgba(167,139,250,0.4)' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>open_in_new</span>
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(10,10,10,0.5)' }}>
                <div className="container" style={{ padding: '28px 16px' }}>
                    <div className="footer-content">
                        <p>
                            <span>© {new Date().getFullYear()} BatchFlow</span>
                            <span>·</span>
                            <a href="https://reforatech.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', fontWeight: 600 }}>Refora Technologies</a>
                            <span>· Made with</span>
                            <span className="footer-heart">❤</span>
                        </p>
                        <p>
                            <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
                            <span style={{ margin: '0 8px', color: 'var(--border-subtle)' }}>|</span>
                            <Link to="/login" style={{ color: 'var(--text-muted)' }}>Sign In</Link>
                            <span style={{ margin: '0 8px', color: 'var(--border-subtle)' }}>|</span>
                            <a href="mailto:reforatech@gmail.com" style={{ color: 'var(--text-muted)' }}>Contact</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

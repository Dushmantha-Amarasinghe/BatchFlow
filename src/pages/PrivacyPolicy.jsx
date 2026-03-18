import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.reforatech.batchflow';

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
        content: 'Your data is kept for as long as you use the service. You can export all your data at any time from the Settings page. To request account deletion, contact us — we will remove all your data from our servers.',
    },
    {
        title: "7. Children's Privacy",
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

export default function PrivacyPolicy() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Scroll-reveal
    useEffect(() => {
        const els = document.querySelectorAll('.home-reveal');
        const io = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('home-visible')),
            { threshold: 0.1 }
        );
        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <div className="home-page">
            {/* ── Nav (shared with Home) ── */}
            <header className={`home-nav${scrolled ? ' home-nav-scrolled' : ''}`}>
                <div className="home-nav-inner">
                    <Link to="/" className="logo">
                        <span className="material-symbols-outlined logo-icon">widgets</span>
                        BatchFlow
                    </Link>
                    <div className="home-nav-right">
                        <nav className="home-nav-links">
                            <Link to="/">Home</Link>
                            <Link to="/#features">Features</Link>
                        </nav>
                        <div className="home-nav-cta">
                            <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
                            <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="home-nav-getapp">
                                <svg width="15" height="15" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="currentColor" d="M48,59.49v393a4.33,4.33,0,0,0,7.37,3.07L260,256,55.37,56.42A4.33,4.33,0,0,0,48,59.49Z"/>
                                    <path fill="currentColor" d="M345.8,174,89.22,32.64l-.16-.09c-4.42-2.4-8.62,3.58-5,7.06L285.19,231.93Z"/>
                                    <path fill="currentColor" d="M84.08,472.39c-3.64,3.48.56,9.46,5,7.06l.16-.09L345.8,338l-60.61-57.95Z"/>
                                    <path fill="currentColor" d="M449.38,231l-71.65-39.46L310.36,256l67.37,64.43L449.38,281C468.87,270.23,468.87,241.77,449.38,231Z"/>
                                </svg>
                                Get the App
                            </a>
                        </div>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <button className="home-nav-mobile-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {mobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
                
                {/* Mobile Menu Dropdown */}
                <div className={`home-mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
                    <div className="home-mobile-menu-links">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link to="/#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                    </div>
                    <div className="home-mobile-menu-cta">
                        <Link to="/login" className="btn btn-ghost" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="home-nav-getapp" onClick={() => setMobileMenuOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                <path fill="currentColor" d="M48,59.49v393a4.33,4.33,0,0,0,7.37,3.07L260,256,55.37,56.42A4.33,4.33,0,0,0,48,59.49Z"/>
                                <path fill="currentColor" d="M345.8,174,89.22,32.64l-.16-.09c-4.42-2.4-8.62,3.58-5,7.06L285.19,231.93Z"/>
                                <path fill="currentColor" d="M84.08,472.39c-3.64,3.48.56,9.46,5,7.06l.16-.09L345.8,338l-60.61-57.95Z"/>
                                <path fill="currentColor" d="M449.38,231l-71.65-39.46L310.36,256l67.37,64.43L449.38,281C468.87,270.23,468.87,241.77,449.38,231Z"/>
                            </svg>
                            Get the App
                        </a>
                    </div>
                </div>
            </header>


            {/* ── Content ── */}
            <main style={{ flex: 1, paddingTop: '100px', paddingBottom: '80px' }}>
                <div className="home-section-container" style={{ maxWidth: '720px' }}>

                    {/* Pill + Title */}
                    <div className="home-reveal" style={{ marginBottom: '56px' }}>
                        <div className="home-badge" style={{ marginBottom: '28px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Legal
                        </div>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', marginBottom: '14px', lineHeight: 1.05 }}>
                            Privacy Policy
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                            BatchFlow by Refora Technologies &nbsp;·&nbsp; Effective March 2025
                        </p>
                    </div>

                    {/* Intro box */}
                    <div className="home-reveal" style={{
                        marginBottom: '48px',
                        background: 'rgba(124,58,237,0.08)',
                        border: '1px solid rgba(124,58,237,0.18)',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#a78bfa', flexShrink: 0, marginTop: '2px' }}>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="12" cy="16" r="1" fill="currentColor"/>
                        </svg>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.75, fontFamily: 'Inter, sans-serif', margin: 0 }}>
                            Refora Technologies built BatchFlow as a free web service. This page informs you about our policies regarding the collection, use, and disclosure of personal information when you use our service.
                        </p>
                    </div>

                    {/* Sections */}
                    {sections.map((s, i) => (
                        <div
                            key={s.title}
                            className="home-reveal"
                            style={{
                                marginBottom: '36px',
                                paddingBottom: '36px',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: '10px',
                            }}>
                                <div style={{
                                    width: '3px',
                                    height: '16px',
                                    background: 'var(--accent-gradient)',
                                    borderRadius: '2px',
                                    flexShrink: 0,
                                }} />
                                <h2 style={{
                                    fontFamily: "'Space Grotesk', sans-serif",
                                    fontSize: '1.05rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                    margin: 0,
                                }}>
                                    {s.title}
                                </h2>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', margin: 0, marginTop: '4px' }}>
                                {s.content}
                            </p>
                            {s.links?.map(l => (
                                <a
                                    key={l.href}
                                    href={l.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        color: '#a78bfa',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        marginTop: '12px',
                                        textDecoration: 'underline',
                                        textDecorationColor: 'rgba(167,139,250,0.35)',
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    {l.label}
                                </a>
                            ))}
                        </div>
                    ))}
                </div>
            </main>

            {/* ── Footer (shared with Home) ── */}
            <footer className="home-footer">
                <div className="home-section-container">
                    <div className="home-footer-grid">
                        <div className="home-footer-brand">
                            <Link to="/" className="logo" style={{ display: 'inline-flex', marginBottom: '14px' }}>
                                <span className="material-symbols-outlined logo-icon">widgets</span>
                                BatchFlow
                            </Link>
                            <p className="home-footer-tagline">Batch management for modern manufacturers.</p>
                            <p className="home-footer-copy">A product of <a href="https://reforatech.com" target="_blank" rel="noopener noreferrer">Refora Technologies</a></p>
                        </div>
                        <div className="home-footer-links">
                            <div className="home-footer-col">
                                <div className="home-footer-heading">Product</div>
                                <Link to="/#features">Features</Link>
                                <Link to="/#platforms">Platforms</Link>
                                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">Play Store</a>
                            </div>
                            <div className="home-footer-col">
                                <div className="home-footer-heading">Company</div>
                                <a href="https://reforatech.com" target="_blank" rel="noopener noreferrer">Refora Technologies</a>
                                <Link to="/privacy-policy">Privacy Policy</Link>
                                <a href="mailto:reforatech@gmail.com">Contact</a>
                            </div>
                        </div>
                    </div>
                    <div className="home-footer-bottom">
                        <span>© {new Date().getFullYear()} Refora Technologies. All rights reserved.</span>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

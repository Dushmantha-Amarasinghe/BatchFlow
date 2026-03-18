import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import playstoreIconUrl from '../assets/playstore icon.svg';

/* ── SVG icon components ── */
function IconBolt() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L4.09 12.96a.5.5 0 0 0 .4.79H11l-1 8.25L19.91 11a.5.5 0 0 0-.41-.78H13L13 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
function IconBox() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
function IconHistory() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="12,8 12,12 14,14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.05 11a9 9 0 1 0 .5-3M3 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
function IconFilePdf() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    );
}
function IconSmartphone() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );
}
function IconShield() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
function IconQr() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
            <circle cx="17.5" cy="17.5" r="1.5" fill="currentColor"/>
            <line x1="14" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="21" y1="14" x2="21" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="14" y1="21" x2="18" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    );
}
function IconGlobe() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    );
}
function IconPlayStore({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M48,59.49v393a4.33,4.33,0,0,0,7.37,3.07L260,256,55.37,56.42A4.33,4.33,0,0,0,48,59.49Z"/>
            <path fill="currentColor" d="M345.8,174,89.22,32.64l-.16-.09c-4.42-2.4-8.62,3.58-5,7.06L285.19,231.93Z"/>
            <path fill="currentColor" d="M84.08,472.39c-3.64,3.48.56,9.46,5,7.06l.16-.09L345.8,338l-60.61-57.95Z"/>
            <path fill="currentColor" d="M449.38,231l-71.65-39.46L310.36,256l67.37,64.43L449.38,281C468.87,270.23,468.87,241.77,449.38,231Z"/>
        </svg>
    );
}
function IconArrowRight() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="12,5 19,12 12,19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}
function IconDownload() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
    );
}

const features = [
    {
        icon: <IconBolt />,
        color: 'purple',
        title: 'Instant Batch Generation',
        desc: 'Generate sequential batch numbers for all your products in a single click. Sequential logic handled automatically.',
    },
    {
        icon: <IconBox />,
        color: 'blue',
        title: 'Full Product Catalogue',
        desc: 'Register products with unique codes and batch patterns. Browse, search, and manage your entire catalogue.',
    },
    {
        icon: <IconHistory />,
        color: 'green',
        title: 'Complete Batch History',
        desc: 'Every batch generation is saved with a timestamp. Quickly revisit and export any previous batch list.',
    },
    {
        icon: <IconFilePdf />,
        color: 'amber',
        title: 'PDF & Barcode Export',
        desc: 'Export batch lists to professional PDF reports. Generate QR codes and barcodes for every product.',
    },
    {
        icon: <IconSmartphone />,
        color: 'teal',
        title: 'Web & Mobile',
        desc: 'Use the full web dashboard from any browser, or install the Android app from Google Play for on-the-go access.',
    },
    {
        icon: <IconShield />,
        color: 'rose',
        title: 'Google-Secured Data',
        desc: 'Your data is protected by Firebase Authentication and Firestore Security Rules. Only you can access it.',
    },
];

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.reforatech.batchflow';

export default function Home() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const featuresRef = useRef(null);

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
            { threshold: 0.12 }
        );
        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);

    const handleGetStarted = () => navigate(currentUser ? '/dashboard' : '/login');

    return (
        <div className="home-page">
            {/* ── Navigation ── */}
            <header className={`home-nav${scrolled ? ' home-nav-scrolled' : ''}`}>
                <div className="home-nav-inner">
                    <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <span className="material-symbols-outlined logo-icon">widgets</span>
                        BatchFlow
                    </div>
                    <div className="home-nav-right">
                        <nav className="home-nav-links">
                            <a href="#features">Features</a>
                            <a href="#platforms">Platforms</a>
                        </nav>
                        <div className="home-nav-cta">
                            {currentUser ? (
                                <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
                            ) : (
                                <>
                                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Log In</button>
                                    <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="home-nav-getapp">
                                        <IconPlayStore size={16} />
                                        Get the App
                                    </a>
                                </>
                            )}
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
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
                        <a href="#platforms" onClick={() => setMobileMenuOpen(false)}>Platforms</a>
                    </div>
                    <div className="home-mobile-menu-cta">
                        {currentUser ? (
                            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
                        ) : (
                            <>
                                <button className="btn btn-ghost" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>Log In</button>
                                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="home-nav-getapp" onClick={() => setMobileMenuOpen(false)}>
                                    <IconPlayStore size={18} />
                                    Get the App
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </header>


            {/* ── Hero ── */}
            <section className="home-hero">
                <div className="home-hero-glow home-hero-glow-1" />
                <div className="home-hero-glow home-hero-glow-2" />
                <div className="home-hero-grid" />

                <div className="home-hero-content home-reveal">
                    <div className="home-badge">
                        <span className="home-badge-dot" />
                        Now on Google Play — Free to Use
                    </div>

                    <h1 className="home-hero-title">
                        Your Batches,<br />
                        <span className="home-hero-gradient">Managed.</span>
                    </h1>

                    <p className="home-hero-sub">
                        Generate, track, and export product batch numbers effortlessly.
                        Built for manufacturers, operators, and QA teams — on web or mobile.
                    </p>

                    <div className="home-hero-cta">
                        <a
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="home-cta-primary"
                        >
                            <IconPlayStore />
                            Get it on Google Play
                        </a>
                        <button className="home-cta-ghost" onClick={handleGetStarted}>
                            {currentUser ? 'Go to Dashboard' : 'Try Web App'}
                            <IconArrowRight />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="home-features-section" id="features">
                <div className="home-section-container">
                    <div className="home-section-header home-reveal">
                        <h2 className="home-section-title">
                            Everything You Need.<br />
                            <span className="home-muted-title">Nothing You Don&apos;t.</span>
                        </h2>
                        <p className="home-section-sub">
                            Built for teams who care about precision and traceability. Simple, fast, and powerful.
                        </p>
                    </div>

                    <div className="home-feature-grid">
                        {features.map((f, i) => (
                            <div key={f.title} className={`home-feature-card home-reveal home-reveal-delay-${i % 3}`}>
                                <div className={`home-feature-icon home-icon-${f.color}`}>
                                    {f.icon}
                                </div>
                                <h3 className="home-feature-title">{f.title}</h3>
                                <p className="home-feature-desc">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Callout: Traceability ── */}
            <section className="home-callout-section">
                <div className="home-section-container">
                    <div className="home-callout-row home-reveal">
                        <div className="home-callout-text">
                            <div className="home-eyebrow">Micro-Traceability</div>
                            <h2 className="home-callout-title">Track It. Trace It.<br />Trust It.</h2>
                            <p className="home-callout-desc">
                                Add raw material notes to every batch generation. Recall exactly which materials entered which batch — always logged, always available.
                            </p>
                            <ul className="home-callout-list">
                                <li>Material notes stored with every batch</li>
                                <li>Searchable full history with timestamps</li>
                                <li>Export batch records to PDF at any time</li>
                                <li>QR code and barcode for every product</li>
                            </ul>
                        </div>
                        <div className="home-callout-visual">
                            <div className="home-callout-card">
                                <div className="home-mock-label">Micro-Traceability Note</div>
                                <div className="home-mock-value">Lavender Oil — Lot #LV-2024-03</div>
                                <div className="home-mock-divider" />
                                <div className="home-mock-row">
                                    <span className="home-mock-key">PRODUCT</span>
                                    <span className="home-mock-val">Organic Soap 200ml</span>
                                </div>
                                <div className="home-mock-row">
                                    <span className="home-mock-key">PREVIOUS</span>
                                    <span className="home-mock-val">OS20-0009</span>
                                </div>
                                <div className="home-mock-row">
                                    <span className="home-mock-key">NEW BATCH</span>
                                    <span className="home-mock-val home-mock-accent">OS20-0010</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Callout: Export ── */}
            <section className="home-callout-section home-callout-alt">
                <div className="home-section-container">
                    <div className="home-callout-row home-callout-row-reverse home-reveal">
                        <div className="home-callout-visual">
                            <div className="home-callout-card">
                                <div className="home-mock-label">Export Options</div>
                                <div className="home-mock-divider" />
                                <div className="home-export-item home-export-pdf">
                                    <IconFilePdf />
                                    <div>
                                        <div className="home-mock-val">PDF Batch Report</div>
                                        <div className="home-mock-key">Professional layout, ready to print</div>
                                    </div>
                                </div>
                                <div className="home-export-item home-export-qr">
                                    <IconQr />
                                    <div>
                                        <div className="home-mock-val">QR Code Sheet</div>
                                        <div className="home-mock-key">One QR code per product</div>
                                    </div>
                                </div>
                                <div className="home-export-item home-export-bar">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="4" width="2" height="16" rx="1" fill="currentColor"/>
                                        <rect x="6" y="4" width="1" height="16" rx="0.5" fill="currentColor"/>
                                        <rect x="9" y="4" width="3" height="16" rx="0.5" fill="currentColor"/>
                                        <rect x="14" y="4" width="1" height="16" rx="0.5" fill="currentColor"/>
                                        <rect x="17" y="4" width="2" height="16" rx="0.5" fill="currentColor"/>
                                        <rect x="21" y="4" width="1" height="16" rx="0.5" fill="currentColor"/>
                                    </svg>
                                    <div>
                                        <div className="home-mock-val">Barcode Print Sheet</div>
                                        <div className="home-mock-key">Standard barcode for each item</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="home-callout-text">
                            <div className="home-eyebrow">Export & Share</div>
                            <h2 className="home-callout-title">Generate. Export.<br />Done.</h2>
                            <p className="home-callout-desc">
                                From batch numbers to print-ready documents in seconds. Export to PDF, QR sheets, or barcode pages — all built in, no third-party tools required.
                            </p>
                            <ul className="home-callout-list">
                                <li>Configurable PDF columns and title</li>
                                <li>QR codes generated per product batch</li>
                                <li>Barcode print sheets with custom per-row count</li>
                                <li>Webhook integration to Shopify or any API</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Platforms ── */}
            <section className="home-platforms-section" id="platforms">
                <div className="home-section-container">
                    <div className="home-section-header home-reveal">
                        <h2 className="home-section-title">
                            Available Everywhere.
                        </h2>
                        <p className="home-section-sub">
                            Use BatchFlow from your desktop browser or install the app on Android — the same powerful workspace, wherever you are.
                        </p>
                    </div>
                    <div className="home-platform-grid home-reveal">
                        <div className="home-platform-card">
                            <div className="home-platform-icon">
                                <IconGlobe />
                            </div>
                            <h3>Web Application</h3>
                            <p>Log in from any browser — Chrome, Firefox, Safari — and access your full workspace instantly. No installation needed.</p>
                            <button className="home-platform-cta home-platform-web" onClick={handleGetStarted}>
                                {currentUser ? 'Open Dashboard' : 'Log In to Web App'}
                                <IconArrowRight />
                            </button>
                        </div>
                        <div className="home-platform-card home-platform-featured">
                            <div className="home-platform-badge">Recommended for Mobile</div>
                            <div className="home-platform-icon">
                                <IconPlayStore />
                            </div>
                            <h3>Android App</h3>
                            <p>Download the BatchFlow app from Google Play. Same full-featured web app wrapped natively for mobile — optimized for on-the-go use.</p>
                            <a
                                href={PLAY_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="home-platform-cta home-platform-google"
                            >
                                <IconDownload />
                                Download on Play Store
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Final CTA ── */}
            <section className="home-final-cta home-reveal">
                <div className="home-final-glow" />
                <div className="home-section-container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 className="home-final-title">Ready to Manage Smarter?</h2>
                    <p className="home-final-sub">
                        Join teams that have already replaced spreadsheets with BatchFlow. Free to use. No credit card required.
                    </p>
                    <div className="home-hero-cta" style={{ marginTop: '36px' }}>
                        <a
                            href={PLAY_STORE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="home-cta-primary"
                        >
                            <IconPlayStore />
                            Get BatchFlow — It&apos;s Free
                        </a>
                        <button className="home-cta-ghost" onClick={handleGetStarted}>
                            {currentUser ? 'Open Dashboard' : 'Try on Web'}
                            <IconArrowRight />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="home-footer">
                <div className="home-section-container">
                    <div className="home-footer-grid">
                        <div className="home-footer-brand">
                            <div className="logo">
                                <span className="material-symbols-outlined logo-icon">widgets</span>
                                BatchFlow
                            </div>
                            <p className="home-footer-tagline">Batch management for modern manufacturers.</p>
                            <p className="home-footer-copy">A product of <a href="https://reforatech.com" target="_blank" rel="noopener noreferrer">Refora Technologies</a></p>
                        </div>
                        <div className="home-footer-links">
                            <div className="home-footer-col">
                                <div className="home-footer-heading">Product</div>
                                <a href="#features">Features</a>
                                <a href="#platforms">Platforms</a>
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

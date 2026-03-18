import React from 'react';

export default function SupportModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal" style={{ zIndex: 9999 }}>
            <div className="modal-content" style={{ maxWidth: '420px', padding: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Space Grotesk',sans-serif", margin: 0 }}>
                        <span style={{ fontSize: '1.2rem', color: '#fbbf24' }}>💛</span>
                        Support the Developer
                    </h2>
                    <button className="modal-close" onClick={onClose} style={{ top: '20px', right: '20px', position: 'absolute', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', padding: '4px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
                    </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                    Thank you for considering supporting BatchFlow! Our country currently doesn't support PayPal or Stripe direct integration, so we accept direct bank transfers.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', marginBottom: '24px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Bank Name</span>
                        <span style={{ fontWeight: 600 }}>Bank of Ceylon</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Branch</span>
                        <span style={{ fontWeight: 600 }}>Delgoda</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Account Name</span>
                        <span style={{ fontWeight: 600 }}>REFORA TECHNOLOGIES</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Account Type</span>
                        <span style={{ fontWeight: 600 }}>Current Account</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'rgba(124, 58, 237, 0.08)', borderRadius: '8px', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                        <span style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 500 }}>Account Number</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: '#a78bfa', letterSpacing: '1px' }}>0096125108</span>
                    </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
}

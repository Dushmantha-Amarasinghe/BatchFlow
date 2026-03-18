import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadPdfSettings, savePdfSettings, loadWebhookSettings, saveWebhookSettings } from '../services/db';
import { useNotification } from '../contexts/NotificationContext';
import { exportAllDataAsCSV } from '../utils/exportData';

export default function Settings() {
    const { currentUser, logout } = useAuth();
    const { showNotification } = useNotification();

    const [pdfSettings, setPdfSettings] = useState({
        title: 'Product Batch List',
        includeDate: true,
        includeProductName: true,
        includeProductCode: true,
        includePreviousBatch: true,
        includeNewBatch: true,
        includeQrCode: true,
        printPerRow: 4,
        printShowLabel: true,
    });

    const [webhookSettings, setWebhookSettings] = useState({ url: '', enabled: false });
    const [savingPdf, setSavingPdf] = useState(false);
    const [savingWebhook, setSavingWebhook] = useState(false);
    const [exportingCsv, setExportingCsv] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAll() {
            try {
                const [pdf, webhook] = await Promise.all([loadPdfSettings(), loadWebhookSettings()]);
                if (pdf) setPdfSettings(p => ({ ...p, ...pdf }));
                if (webhook) setWebhookSettings(webhook);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        loadAll();
    }, []);

    async function handleSavePdf(e) {
        e.preventDefault();
        setSavingPdf(true);
        try {
            await savePdfSettings(pdfSettings);
            showNotification('PDF settings saved!', 'success');
        } catch { showNotification('Error saving settings', 'error'); }
        finally { setSavingPdf(false); }
    }

    async function handleSaveWebhook(e) {
        e.preventDefault();
        setSavingWebhook(true);
        try {
            await saveWebhookSettings(webhookSettings);
            showNotification('Webhook settings saved!', 'success');
        } catch { showNotification('Error saving webhook settings', 'error'); }
        finally { setSavingWebhook(false); }
    }

    async function handleExportCSV() {
        setExportingCsv(true);
        try {
            await exportAllDataAsCSV();
            showNotification('Data exported to CSV!', 'success');
        } catch (err) {
            console.error(err);
            showNotification('Error exporting data', 'error');
        } finally { setExportingCsv(false); }
    }

    const ToggleRow = ({ label, description, settingKey, settings, setSettings }) => (
        <div className="settings-toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                {description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</div>}
            </div>
            <label className="toggle-switch" style={{ flexShrink: 0 }}>
                <input type="checkbox" checked={settings[settingKey] ?? true} onChange={e => setSettings({ ...settings, [settingKey]: e.target.checked })} />
                <span className="toggle-track" />
            </label>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
                <div className="loading" />
            </div>
        );
    }

    return (
        <div className="tab-content active" id="settings">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Configure BatchFlow to fit your workflow.</p>
            </div>

            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Account
                </h3>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '50%' }} referrerPolicy="no-referrer" />
                    ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#7c3aed', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            {currentUser?.displayName?.[0] || 'U'}
                        </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{currentUser?.displayName || 'User'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</div>
                    </div>
                    <div style={{ padding: '6px 12px', background: 'rgba(0, 245, 118, 0.1)', border: '1px solid rgba(0, 245, 118, 0.2)', borderRadius: 'var(--radius-pill)', fontSize: '0.75rem', fontWeight: 'bold', color: '#00f576', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Google Auth <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check</span>
                    </div>
                </div>
                {/* Sign Out Button (visible primarily on mobile) */}
                <div className="hide-on-desktop" style={{ marginTop: '16px' }}>
                    <button className="btn btn-danger" onClick={logout} style={{ width: '100%', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Data Export */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#00f576' }}>download</span>
                    Data Export
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '16px' }}>
                    Export all your data — products, categories, full batch history, and settings — as a single CSV file. Use this for backups or migrating to another system.
                </p>
                <button className="btn btn-secondary" onClick={handleExportCSV} disabled={exportingCsv} style={{ width: '100%', justifyContent: 'center' }}>
                    {exportingCsv ? <><div className="loading" />Exporting…</> : <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>download</span>Export All Data (CSV)</>}
                </button>
            </div>

            {/* PDF Settings */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#a78bfa' }}>picture_as_pdf</span>
                    PDF Export Defaults
                </h3>
                <form onSubmit={handleSavePdf}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                        <label className="form-label">Default PDF Title</label>
                        <input type="text" className="form-control" value={pdfSettings.title} onChange={e => setPdfSettings({ ...pdfSettings, title: e.target.value })} />
                    </div>
                    <ToggleRow label="Include generation date" settingKey="includeDate" settings={pdfSettings} setSettings={setPdfSettings} />
                    <ToggleRow label="Include product name" settingKey="includeProductName" settings={pdfSettings} setSettings={setPdfSettings} />
                    <ToggleRow label="Include product code" settingKey="includeProductCode" settings={pdfSettings} setSettings={setPdfSettings} />
                    <ToggleRow label="Include previous batch" settingKey="includePreviousBatch" settings={pdfSettings} setSettings={setPdfSettings} />
                    <ToggleRow label="Include new batch number" settingKey="includeNewBatch" settings={pdfSettings} setSettings={setPdfSettings} />
                    <ToggleRow label="Include QR code per row" settingKey="includeQrCode" settings={pdfSettings} setSettings={setPdfSettings} />

                    <div style={{ paddingTop: '16px', marginTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Print Sheet Defaults</div>
                        <div className="form-group" style={{ marginBottom: '14px' }}>
                            <label className="form-label">Items Per Row</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {[2, 3, 4, 5, 6].map(n => (
                                    <button key={n} type="button"
                                        onClick={() => setPdfSettings({ ...pdfSettings, printPerRow: n })}
                                        style={{
                                            padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
                                            background: pdfSettings.printPerRow === n ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.05)',
                                            color: pdfSettings.printPerRow === n ? '#a78bfa' : 'var(--text-secondary)',
                                            fontFamily: "monospace", fontWeight: 600,
                                            border: pdfSettings.printPerRow === n ? '1px solid rgba(124,58,237,0.4)' : '1px solid var(--border-subtle)',
                                            transition: 'all 0.15s ease',
                                        }}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <div className="form-hint">How many QR codes or barcodes per row on the print sheet</div>
                        </div>
                        <ToggleRow label="Show batch code label under each symbol" settingKey="printShowLabel" settings={pdfSettings} setSettings={setPdfSettings} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary" disabled={savingPdf}>
                            {savingPdf ? <div className="loading" /> : <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>}
                            {savingPdf ? 'Saving…' : 'Save PDF Settings'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Webhook */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#a78bfa' }}>webhook</span>
                    Webhook Integration
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', lineHeight: 1.6, marginBottom: '16px' }}>
                    Connect BatchFlow to Shopify, WooCommerce, or any service. When enabled, BatchFlow will POST batch data to this URL after each generation.
                </p>
                <div className="info-box info" style={{ marginBottom: '16px', fontSize: '0.8rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem', flexShrink: 0 }}>code</span>
                    <div><strong>Payload Format</strong><br /><code style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{`{ "generated_at": "...", "type": "new|current", "batches": [...] }`}</code></div>
                </div>
                <form onSubmit={handleSaveWebhook}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="webhookUrl">Webhook URL</label>
                        <input type="url" className="form-control" id="webhookUrl" placeholder="https://hooks.example.com/batchflow" value={webhookSettings.url} onChange={e => setWebhookSettings({ ...webhookSettings, url: e.target.value })} />
                        <div className="form-hint">Your endpoint must accept POST requests with a JSON body.</div>
                    </div>
                    <div className="settings-toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>Enable Webhook</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trigger the webhook after every batch generation</div>
                        </div>
                        <label className="toggle-switch" style={{ flexShrink: 0 }}>
                            <input type="checkbox" checked={webhookSettings.enabled || false} onChange={e => setWebhookSettings({ ...webhookSettings, enabled: e.target.checked })} />
                            <span className="toggle-track" />
                        </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button type="submit" className="btn btn-primary" disabled={savingWebhook}>
                            {savingWebhook ? <div className="loading" /> : <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>}
                            {savingWebhook ? 'Saving…' : 'Save Webhook Settings'}
                        </button>
                    </div>
                </form>
            </div>

            {/* App Info */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
                    About BatchFlow
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Version</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>2.0.0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Made by</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Refora Technologies</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Stack</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>React + Firebase + jsPDF</span>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <button className="btn btn-ghost btn-sm" style={{ gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>open_in_new</span>
                        Refora Technologies
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const { loginWithGoogle, currentUser } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // If user is already logged in, redirect to dashboard
    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, navigate]);

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            // signInWithRedirect navigates away — result is handled by
            // onAuthStateChanged in AuthContext after returning from Google
            await loginWithGoogle();
        } catch (err) {
            setError('Failed to sign in with Google. Please try again.');
            console.error(err);
            setLoading(false);
        }
    }


    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Logo */}
                <div className="logo" style={{ justifyContent: 'center', fontSize: '1.8rem', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined logo-icon" style={{ fontSize: '2.2rem' }}>widgets</span>
                    BatchFlow
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '36px' }}>
                    by Refora Technologies
                </p>

                <h2 style={{ fontSize: '1.6rem', fontFamily: "'Space Grotesk', sans-serif", marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Welcome back
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '36px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    Sign in to manage your product batch numbers securely.
                </p>

                {error && (
                    <div className="info-box warning" style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem', flexShrink: 0 }}>warning</span>
                        {error}
                    </div>
                )}

                <button onClick={handleGoogleLogin} disabled={loading} className="google-btn">
                    {loading ? (
                        <div className="loading" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }} />
                    ) : (
                        <img
                            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                            alt="Google logo"
                            className="google-icon"
                        />
                    )}
                    {loading ? 'Signing in…' : 'Continue with Google'}
                </button>

                <p style={{ marginTop: '28px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    By signing in you agree to our{' '}
                    <a href="/privacy-policy" style={{ color: '#a78bfa' }}>Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}

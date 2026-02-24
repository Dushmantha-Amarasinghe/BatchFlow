import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
    const { loginWithGoogle } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to log in with Google.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="logo" style={{ justifyContent: 'center', marginBottom: '30px', fontSize: '2.5rem' }}>
                    <span className="material-symbols-outlined logo-icon" style={{ fontSize: '3rem' }}>widgets</span>
                    <span>BatchFlow</span>
                </div>

                <h2 style={{ marginBottom: '10px' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    Sign in to manage your batch numbers
                </p>

                {error && <div className="notification error" style={{ position: 'relative', top: 0, right: 0, marginBottom: '20px', animation: 'none' }}>{error}</div>}

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="google-btn"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google logo"
                        className="google-icon"
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

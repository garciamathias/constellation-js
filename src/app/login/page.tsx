'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginWithFirebase } from '@/lib/firebase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const user = await loginWithFirebase(email, password);
            
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    email,
                    uid: user.uid
                })
            });
            
            if (response.ok) {
                sessionStorage.setItem('ignoreAuthChange', 'true');
                window.location.href = '/';
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erreur de connexion');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="logo-container">
                    <img src="/logo.png" alt="Constellation Logo" />
                </div>
                <h2>Connexion</h2>
                {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        required
                    />
                    <button type="submit">Se connecter</button>
                </form>
                <p>Pas encore de compte ? <Link href="/register">S'inscrire</Link></p>
                <p>Mot de passe oublié ? <Link href="/reset-password">Réinitialiser</Link></p>
            </div>
        </div>
    );
}
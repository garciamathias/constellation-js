'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerWithFirebase } from '@/lib/firebase';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            const user = await registerWithFirebase(email, password);
            
            sessionStorage.setItem('ignoreAuthChange', 'true');
            sessionStorage.setItem('user', JSON.stringify(user));
            router.push('/');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="logo-container">
                    <img src="/logo.png" alt="Constellation Logo" />
                </div>
                <h2>Inscription</h2>
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
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez le mot de passe"
                        required
                    />
                    <button type="submit">S&apos;inscrire</button>
                </form>
                <p>Déjà inscrit ? <Link href="/login">Se connecter</Link></p>
            </div>
        </div>
    );
}
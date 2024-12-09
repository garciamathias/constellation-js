'use client';

import { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setIsSuccess(true);
            setMessage('Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.');
        } catch (error) {
            setIsSuccess(false);
            setMessage(error instanceof Error ? error.message : 'Erreur lors de l\'envoi');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <div className="logo-container">
                    <img src="/logo.png" alt="Constellation Logo" />
                </div>
                <h2>Réinitialisation du mot de passe</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <button type="submit">Envoyer le lien de réinitialisation</button>
                </form>
                <p><Link href="/login">Retour à la connexion</Link></p>
                {message && (
                    <div id="resetMessage" style={{
                        display: 'block',
                        color: isSuccess ? 'green' : 'red',
                        textAlign: 'center',
                        marginTop: '15px'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}
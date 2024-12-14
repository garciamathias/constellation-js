'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Vérifier si une préférence est stockée
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setIsDark(storedTheme === 'dark');
            document.body.classList.toggle('theme-light', storedTheme === 'light');
        } else {
            // Par défaut, utiliser le thème sombre
            setIsDark(true);
            localStorage.setItem('theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        document.body.classList.toggle('theme-light', !newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };

    return (
        <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
        >
            <Image
                src={isDark ? "/icons/light-mode-icon.png" : "/icons/night-mode-icon.png"}
                alt={isDark ? "Mode clair" : "Mode sombre"}
                width={24}
                height={24}
                priority
            />
        </button>
    );
};

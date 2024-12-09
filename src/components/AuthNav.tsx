import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logoutFromFirebase } from '@/lib/firebase';

export const AuthNav = ({ userEmail }: { userEmail: string }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logoutFromFirebase();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="profile-menu" ref={menuRef}>
            <div 
                className="profile-button" 
                onClick={() => setShowDropdown(!showDropdown)}
                role="button"
                tabIndex={0}
            >
                <Image 
                    src="/default-avatar.jpeg" 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                    className="profile-image"
                />
            </div>
            {showDropdown && (
                <div className="dropdown-menu">
                    <div className="user-info">
                        <Image 
                            src="/default-avatar.jpeg" 
                            alt="Profile" 
                            width={60} 
                            height={60} 
                            className="profile-image-large"
                        />
                        <span className="user-email">{userEmail}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item">
                        <Image 
                            src="/icons/logout-icon.png" 
                            alt="Logout" 
                            width={20} 
                            height={20} 
                            className="menu-icon"
                        />
                        <span>Se déconnecter</span>
                    </button>
                </div>
            )}
        </div>
    );
};
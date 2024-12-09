import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logoutFromFirebase } from '@/lib/firebase';

export const AuthNav = ({ userEmail }: { userEmail: string }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logoutFromFirebase();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="profile-menu">
            <div 
                className="profile-button" 
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <Image 
                    src="/static/images/default-avatar.jpeg" 
                    alt="Profile" 
                    width={40} 
                    height={40} 
                    className="profile-image"
                />
            </div>
            {showDropdown && (
                <div className="dropdown-menu">
                    <div className="user-email">{userEmail}</div>
                    <button onClick={handleLogout} className="dropdown-item">
                        <Image 
                            src="/static/images/icons/logout-icon.png" 
                            alt="Logout" 
                            width={20} 
                            height={20} 
                            className="menu-icon"
                        />
                        Se déconnecter
                    </button>
                </div>
            )}
        </div>
    );
};
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthHook {
    user: User | null;
    loading: boolean;
}

const useAuth = (): AuthHook => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { user, loading };
};

export { useAuth };
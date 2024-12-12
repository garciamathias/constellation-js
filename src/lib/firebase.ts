import { initializeApp, getApps } from 'firebase/app';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    updateDoc, 
    increment,
    serverTimestamp,
    collection, 
    query, 
    orderBy, 
    getDocs 
} from '@firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

interface UserData {
    displayName: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
    totalChats: number;
    totalMessages: number;
    lastChatId?: string;
}

export const createUserProfile = async (userId: string, email: string) => {
    const userRef = doc(db, "users", userId);
    const userData: UserData = {
        displayName: email.split('@')[0], // Default display name
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        totalChats: 0,
        totalMessages: 0
    };

    await setDoc(userRef, userData);
    return userData;
};

export const updateUserLoginTimestamp = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

export const incrementUserChatCount = async (userId: string, chatId: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        totalChats: increment(1),
        lastChatId: chatId,
        updatedAt: serverTimestamp()
    });
};

export const incrementUserMessageCount = async (userId: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        totalMessages: increment(1),
        updatedAt: serverTimestamp()
    });
};

export const loginWithFirebase = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await updateUserLoginTimestamp(userCredential.user.uid);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const registerWithFirebase = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user.uid, email);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const logoutFromFirebase = async () => {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        throw error;
    }
};

// Add utility function for getting chat messages
export const getChatMessages = async (chatId: string) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("message_order", "asc"));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Add functions for managing chat title
export const generateChatTitle = (firstMessage: string) => {
  const words = firstMessage.split(' ').slice(0, 5).join(' ');
  return words + (firstMessage.split(' ').length > 5 ? '...' : '');
};

export const updateChatTitle = async (chatId: string, title: string) => {
  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    title: title
  });
};
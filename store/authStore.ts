import {create} from 'zustand';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    UserCredential
} from 'firebase/auth';

export interface User {
    uid: string;
    email: string;
    role: 'admin' | 'barista';
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    login: (email: string, password: string) => Promise<UserCredential>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    login: async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    },
    register: async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            role: 'admin',
        });
    },
    logout: async () => {
        await signOut(auth);
        set({ user: null });
    },
}));

// Initialize auth state listener
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        useAuthStore.getState().setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            role: userData?.role,
        });
    } else {
        useAuthStore.getState().setUser(null);
    }
    useAuthStore.getState().setLoading(false);
});


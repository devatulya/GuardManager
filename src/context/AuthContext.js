import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { auth } from '../firebaseConfig';
import { getProfile } from '../services/profile';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Fetch profile to see if setup is complete
                try {
                    const userProfile = await getProfile(currentUser.uid);
                    setProfile(userProfile);
                } catch (e) {
                    console.error("Error fetching profile on auth change:", e);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const googleLogin = async () => {
        try {
            if (Platform.OS === 'web') {
                const provider = new GoogleAuthProvider();
                return await signInWithPopup(auth, provider);
            } else {
                throw new Error("Google Sign-In is currently only supported on Web.");
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, profile, setProfile, loading, login, signup, googleLogin, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const createProfile = async (uid, profileData) => {
    try {
        const userRef = doc(db, 'supervisors', uid, 'profile', 'info');
        await setDoc(userRef, {
            ...profileData,
            updatedAt: serverTimestamp()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error creating profile:", error);
        throw error;
    }
};

export const getProfile = async (uid) => {
    try {
        const userRef = doc(db, 'supervisors', uid, 'profile', 'info');
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
};

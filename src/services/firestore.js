import { collection, doc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

// Helper to get a scoped collection reference
export const getScopedCollection = (collectionName) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("Attempted to access Firestore without authentication");
        // Throwing error might crash ongoing async ops if not caught, but it's better than data leak
        // For now, let's return a null path or throw.
        throw new Error("User not authenticated");
    }
    return collection(db, `supervisors/${user.uid}/${collectionName}`);
};

// Helper to get a scoped document reference
export const getScopedDoc = (collectionName, docId) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return doc(db, `supervisors/${user.uid}/${collectionName}`, docId);
};

import { addDoc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getScopedCollection, getScopedDoc } from './firestore';

export const addGuard = async (guardData) => {
    const guardsRef = getScopedCollection('guards');
    return await addDoc(guardsRef, {
        ...guardData,
        createdAt: serverTimestamp(),
    });
};

export const updateGuardDetails = async (guardId, guardData) => {
    const guardRef = getScopedDoc('guards', guardId);
    return await updateDoc(guardRef, {
        ...guardData,
        updatedAt: serverTimestamp(),
    });
};

export const getGuards = async () => {
    const guardsRef = getScopedCollection('guards');
    const q = query(guardsRef, orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

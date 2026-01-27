import { addDoc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getScopedCollection, getScopedDoc } from './firestore';

export const addSite = async (siteData) => {
    const sitesRef = getScopedCollection('sites');
    return await addDoc(sitesRef, {
        ...siteData,
        createdAt: serverTimestamp(),
    });
};

export const updateSiteDetails = async (siteId, siteData) => {
    const siteRef = getScopedDoc('sites', siteId);
    return await updateDoc(siteRef, {
        ...siteData,
        updatedAt: serverTimestamp(),
    });
};


export const getSites = async () => {
    const sitesRef = getScopedCollection('sites');
    const q = query(sitesRef, orderBy('name', 'asc')); // Default sort by name
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

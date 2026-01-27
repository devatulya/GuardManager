import { addDoc, deleteDoc, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { getScopedCollection, getScopedDoc } from './firestore';

/**
 * Fetch advances for a specific guard in a given month.
 * @param {string} guardId 
 * @param {string} monthStr - Format "YYYY-MM"
 * @returns {Promise<number>} Total amount of advances
 */
export const getAdvancesForGuard = async (guardId, monthStr) => {
    try {
        const advancesRef = getScopedCollection('advances');

        // Calculate start and end dates for the month
        // Assuming 'date' in advances is stored as YYYY-MM-DD string
        const startDate = `${monthStr}-01`;

        // Calculate last day of month
        const [year, month] = monthStr.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${monthStr}-${lastDay}`;

        const q = query(
            advancesRef,
            where('guardId', '==', guardId),
            where('date', '>=', startDate),
            where('date', '<=', endDate)
        );

        const snapshot = await getDocs(q);

        let totalAdvances = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            totalAdvances += (Number(data.amount) || 0);
        });

        return totalAdvances;
    } catch (error) {
        console.error("Error fetching advances:", error);
        return 0; // Return 0 on error as per requirements
    }
};

export const addAdvance = async (advanceData) => {
    const advancesRef = getScopedCollection('advances');
    return await addDoc(advancesRef, {
        ...advanceData,
        createdAt: serverTimestamp(),
    });
};

export const getRecentAdvances = async (limitCount = 10) => {
    const advancesRef = getScopedCollection('advances');
    // Order by date desc, then createdAt desc
    const q = query(advancesRef, orderBy('date', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllAdvances = async (guardId = null) => {
    const advancesRef = getScopedCollection('advances');
    let q;

    // Sort logic helper
    const sortByDateDesc = (a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    };

    if (guardId) {
        // Filter by guard ONLY (avoid composite index requirement)
        q = query(advancesRef, where('guardId', '==', guardId));
    } else {
        // All guards, order by date desc (single field index works automatically)
        q = query(advancesRef, orderBy('date', 'desc'));
    }

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // If filtered by guard, we need to sort manually since we removed orderBy
    if (guardId) {
        data.sort(sortByDateDesc);
    }

    return data;
};

export const deleteAdvance = async (advanceId) => {
    const advanceDoc = getScopedDoc('advances', advanceId);
    await deleteDoc(advanceDoc);
};

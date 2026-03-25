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

        // Query by forMonth field (new records) OR fall back to date range (legacy records)
        const q = query(
            advancesRef,
            where('guardId', '==', guardId),
            where('forMonth', '==', monthStr)
        );

        const snapshot = await getDocs(q);

        let totalAdvances = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            totalAdvances += (Number(data.amount) || 0);
        });

        // Also check legacy records that don't have forMonth (date-based fallback)
        const startDate = `${monthStr}-01`;
        const [year, month] = monthStr.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${monthStr}-${lastDay}`;

        const legacyQ = query(
            advancesRef,
            where('guardId', '==', guardId),
            where('date', '>=', startDate),
            where('date', '<=', endDate)
        );

        const legacySnapshot = await getDocs(legacyQ);
        const forMonthIds = new Set(snapshot.docs.map(d => d.id));
        legacySnapshot.forEach(doc => {
            if (!forMonthIds.has(doc.id) && !doc.data().forMonth) {
                totalAdvances += (Number(doc.data().amount) || 0);
            }
        });

        return totalAdvances;
    } catch (error) {
        console.error("Error fetching advances:", error);
        return 0;
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

export const getAllAdvances = async (guardId = null, monthStr = null) => {
    const advancesRef = getScopedCollection('advances');
    let baseQueryArgs = [advancesRef];

    // Build constraints dynamically
    if (guardId) {
        baseQueryArgs.push(where('guardId', '==', guardId));
    }

    if (monthStr) {
        baseQueryArgs.push(where('forMonth', '==', monthStr));
    }

    // Add ordering if we aren't filtering by guard (single index)
    if (!guardId && !monthStr) {
        baseQueryArgs.push(orderBy('date', 'desc'));
    }

    const q = query(...baseQueryArgs);

    const snapshot = await getDocs(q);
    let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Also fetch legacy records without forMonth if filtering by month
    if (monthStr) {
        const startDate = `${monthStr}-01`;
        const [year, month] = monthStr.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${monthStr}-${lastDay}`;

        let legacyArgs = [advancesRef];
        if (guardId) legacyArgs.push(where('guardId', '==', guardId));
        legacyArgs.push(where('date', '>=', startDate));
        legacyArgs.push(where('date', '<=', endDate));

        const legacySnapshot = await getDocs(query(...legacyArgs));
        const existingIds = new Set(data.map(d => d.id));
        legacySnapshot.docs.forEach(doc => {
            if (!existingIds.has(doc.id) && !doc.data().forMonth) {
                data.push({ id: doc.id, ...doc.data() });
            }
        });
    }

    // Sort by date descending
    data.sort((a, b) => {
        const dateA = a.date || '';
        const dateB = b.date || '';
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return 0;
    });

    return data;
};

export const deleteAdvance = async (advanceId) => {
    const advanceDoc = getScopedDoc('advances', advanceId);
    await deleteDoc(advanceDoc);
};

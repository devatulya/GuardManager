import {
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getScopedCollection, getScopedDoc } from './firestore';
import { getGuards } from './guards';

export const markAttendance = async (attendanceData) => {
    const attendanceRef = getScopedCollection('attendance');
    return await addDoc(attendanceRef, {
        ...attendanceData,
        createdAt: serverTimestamp(),
    });
};

export const deleteAttendance = async (attendanceId) => {
    const attendanceDoc = getScopedDoc('attendance', attendanceId); // Using getScopedDoc from imports
    await deleteDoc(attendanceDoc);
};

export const markBulkAttendance = async (siteId, dateStr) => {
    const guards = await getGuards();
    const activeGuards = guards.filter(g => g.active && g.defaultSiteId === siteId);

    if (activeGuards.length === 0) return 0;

    const batch = writeBatch(db);
    const attendanceRef = getScopedCollection('attendance');

    activeGuards.forEach(guard => {
        const newDocRef = doc(attendanceRef);
        batch.set(newDocRef, {
            guardId: guard.id,
            guardName: guard.name,
            siteId,
            date: dateStr,
            startTime: guard.defaultStartTime || '08:00',
            endTime: guard.defaultEndTime || '20:00',
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();
    return activeGuards.length;
};

export const markGlobalAttendance = async (dateStr) => {
    console.log('markGlobalAttendance started for:', dateStr);
    try {
        const guards = await getGuards();
        console.log('Guards fetched:', guards?.length);
        const activeGuards = guards.filter(g => g.active && g.defaultSiteId);
        console.log('Active guards count:', activeGuards.length);

        if (activeGuards.length === 0) return 0;

        const batch = writeBatch(db);
        console.log('Batch created');
        const attendanceRef = getScopedCollection('attendance');
        console.log('Attendance Ref created');

        activeGuards.forEach((guard, index) => {
            // console.log(`Processing guard ${index}: ${guard.id}`);
            const newDocRef = doc(attendanceRef);
            // console.log('Doc ref created');
            batch.set(newDocRef, {
                guardId: guard.id,
                guardName: guard.name,
                siteId: guard.defaultSiteId,
                siteName: guard.defaultSiteName || 'Default Site',
                date: dateStr,
                startTime: guard.defaultStartTime || '08:00',
                endTime: guard.defaultEndTime || '20:00',
                createdAt: serverTimestamp(),
                type: 'auto_global'
            });
        });

        console.log('Committing batch...');
        await batch.commit();
        console.log('Batch committed');
        return activeGuards.length;
    } catch (error) {
        console.error('Error in markGlobalAttendance:', error);
        throw error;
    }
};

export const getAttendanceProgress = async (dateStr) => {
    const guards = await getGuards();
    const totalActive = guards.filter(g => g.active).length;

    const attendanceRef = getScopedCollection('attendance');
    const q = query(attendanceRef, where('date', '==', dateStr));
    const snapshot = await getDocs(q);

    const presentGuardIds = new Set(snapshot.docs.map(d => d.data().guardId));

    return {
        total: totalActive,
        present: presentGuardIds.size
    };
};

export const getAttendanceByDate = async (dateStr) => {
    const attendanceRef = getScopedCollection('attendance');
    const q = query(attendanceRef, where('date', '==', dateStr));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

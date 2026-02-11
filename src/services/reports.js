import { getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { getAdvancesForGuard } from './advances';
import { getScopedCollection, getScopedDoc } from './firestore';

/**
 * Report Type 1: Site-wise Report
 * @param {string} siteId
 * @param {string} startDate (YYYY-MM-DD)
 * @param {string} endDate (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of attendance records
 */
export const generateSiteWiseReport = async (siteId, startDate, endDate) => {
    try {
        if (!siteId || !startDate || !endDate) return [];

        const attendanceRef = getScopedCollection('attendance');
        const q = query(
            attendanceRef,
            where('siteId', '==', siteId),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'asc')
        );

        const snapshot = await getDocs(q);

        // Map to requested output format
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                date: data.date,
                guardName: data.guardName || 'Unknown', // Join logic: data already has guardName
                startTime: data.startTime || '-',
                endTime: data.endTime || '-'
            };
        });
    } catch (error) {
        console.error("Error generating site report:", error);
        return [];
    }
};

/**
 * Report Type 2: Guard-wise Report (Monthly)
 * @param {string} guardId
 * @param {string} month (YYYY-MM)
 * @returns {Promise<Object>} Salary details and attendance list
 */
export const generateGuardWiseReport = async (guardId, month) => {
    try {
        if (!guardId || !month) return {};

        // 1. Fetch Guard Document for monthlySalary
        // Since we don't have getGuard helper exposed with ID easy, we use getScopedDoc
        // Wait, guards are in 'guards' collection.
        const guardRef = getScopedDoc('guards', guardId);
        const guardSnap = await getDoc(guardRef);

        if (!guardSnap.exists()) return "Unknown";

        const guardData = guardSnap.data();
        const monthlySalary = Number(guardData.monthlySalary) || 0;
        const guardName = guardData.name || 'Unknown';

        // 2. Fetch Attendance for attributes month
        // Calculate date range
        const startDate = `${month}-01`;
        const [year, m] = month.split('-').map(Number);
        const lastDay = new Date(year, m, 0).getDate();
        const endDate = `${month}-${lastDay}`;

        const attendanceRef = getScopedCollection('attendance');
        const q = query(
            attendanceRef,
            where('guardId', '==', guardId),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'asc')
        );

        const attSnapshot = await getDocs(q);
        const attendanceList = attSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                date: data.date,
                siteName: data.siteName || 'Unknown',
                startTime: data.startTime,
                endTime: data.endTime
            };
        });

        const daysWorked = attendanceList.length; // Simple count of records

        // 3. Fetch Advances
        const totalAdvances = await getAdvancesForGuard(guardId, month);

        // 4. Salary Calculation
        // daysInMonth: using lastDay calculated above
        const daysInMonth = lastDay;

        // Avoid division by zero
        const perDaySalary = daysInMonth > 0 ? (monthlySalary / daysInMonth) : 0;
        const earnedSalary = perDaySalary * daysWorked;
        const finalPayable = earnedSalary - totalAdvances;

        // 5. Output Format
        return {
            guardName,
            month,
            daysWorked,
            monthlySalary,
            totalAdvances,
            finalPayable: Math.round(finalPayable), // Rounding for display
            attendance: attendanceList
        };

    } catch (error) {
        console.error("Error generating guard report:", error);
        return {};
    }
};

/**
 * Report Type 3: Daily Report (Date-wise)
 * @param {string} date (YYYY-MM-DD)
 * @returns {Promise<Array>} Sorted array of attendance records
 */
export const generateDailyReport = async (date) => {
    try {
        if (!date) return [];

        const attendanceRef = getScopedCollection('attendance');
        const q = query(
            attendanceRef,
            where('date', '==', date)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                date: d.date,
                siteName: d.siteName || 'Unknown Site',
                guardName: d.guardName || 'Unknown Guard',
                startTime: d.startTime || '-',
                endTime: d.endTime || '-'
            };
        });

        // 3. Sorting Requirement: Site Name (A-Z) -> Guard Name (A-Z)
        return data.sort((a, b) => {
            const siteComparison = (a.siteName || '').localeCompare(b.siteName || '');
            if (siteComparison !== 0) return siteComparison;
            return (a.guardName || '').localeCompare(b.guardName || '');
        });

    } catch (error) {
        console.error("Error generating daily report:", error);
        return [];
    }
};

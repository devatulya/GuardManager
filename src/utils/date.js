export const formatDate = (dateOrString) => {
    if (!dateOrString) return '';

    // If it's a string like YYYY-MM-DD, split and reorder
    if (typeof dateOrString === 'string') {
        // Check if it's already DD/MM/YYYY (basic check)
        if (dateOrString.includes('/') && dateOrString.split('/')[0].length === 2) {
            return dateOrString;
        }

        // Handle YYYY-MM-DD
        if (dateOrString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateOrString.split('-');
            return `${day}/${month}/${year}`;
        }

        // Try parsing
        const d = new Date(dateOrString);
        if (isNaN(d.getTime())) return dateOrString;
        return formatDateFromObj(d);
    }

    // If Date object
    if (dateOrString instanceof Date) {
        return formatDateFromObj(dateOrString);
    }

    return String(dateOrString);
};

const formatDateFromObj = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

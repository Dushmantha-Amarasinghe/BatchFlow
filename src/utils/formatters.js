export function formatDateForBatch(date = new Date()) {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
}

export function formatDate(dateInput, short = false) {
    let date;

    if (dateInput && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
    } else if (dateInput) {
        date = new Date(dateInput);
    } else {
        return '-';
    }

    if (isNaN(date.getTime())) {
        return '-';
    }

    if (short) {
        return date.toLocaleDateString();
    }

    return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
}

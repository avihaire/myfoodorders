document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
    const table = document.getElementById('history-table');

    history.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.type}</td>
            <td>${entry.amount} ₪</td>
        `;
        table.appendChild(row);
    });
}

function clearHistory() {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?')) {
        localStorage.removeItem('orderHistory');
        location.reload();
    }
}

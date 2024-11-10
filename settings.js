document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadButtons();
});

// טעינת ההגדרות
function loadSettings() {
    // טעינת כמות הניקובים השבועית
    const maxOrders = localStorage.getItem('maxOrders') || 3;
    document.getElementById('max-orders').value = maxOrders;

    // טעינת הסכום השבועי
    const weeklyBudget = localStorage.getItem('weeklyBudget') || 0;
    document.getElementById('weekly-budget').value = weeklyBudget;
}

// שמירת כמות הניקובים בהגדרות
function saveMaxOrders() {
    const maxOrders = parseInt(document.getElementById('max-orders').value);

    if (isNaN(maxOrders) || maxOrders <= 0) {
        alert("נא להזין מספר תקין");
        return;
    }

    localStorage.setItem('maxOrders', maxOrders);
    localStorage.setItem('remainingOrders', maxOrders);
    updateRemainingOrdersDisplay();
    alert('כמות הניקובים נשמרה בהצלחה!');
    window.location.reload();
}

// שמירת הסכום השבועי
function saveWeeklyBudget() {
    const weeklyBudget = parseFloat(document.getElementById('weekly-budget').value);
    localStorage.setItem('weeklyBudget', weeklyBudget);
    localStorage.setItem('currentSpent', 0);
    alert('הסכום השבועי נשמר בהצלחה!');
    window.location.reload();
}

// עדכון תצוגת הניקובים בעמוד הראשי (אם פתוח)
function updateRemainingOrdersDisplay() {
    const remainingCount = document.getElementById('remaining-count');
    if (remainingCount) {
        const remainingOrders = localStorage.getItem('remainingOrders');
        remainingCount.textContent = remainingOrders;
    }
}

// טעינת כפתורים מדף ההגדרות
function loadButtons() {
    const buttons = JSON.parse(localStorage.getItem('buttons')) || [
        { label: 'הזמנה אלה' },
        { label: 'הזמנה אביחי' },
        { label: 'הזמנה משותפת' }
    ];
    renderButtons(buttons);
}

// פונקציה להצגת כפתורים בדף ההגדרות
function renderButtons(buttons) {
    const container = document.getElementById('buttons-container');
    container.innerHTML = '';

    buttons.forEach((button, index) => {
        const div = document.createElement('div');
        div.className = 'button-row';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = button.label;
        input.onchange = () => updateButtonLabel(index, input.value);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'מחק';
        removeBtn.onclick = () => removeButton(index);

        div.appendChild(input);
        div.appendChild(removeBtn);
        container.appendChild(div);
    });

    localStorage.setItem('buttons', JSON.stringify(buttons));
}

function updateButtonLabel(index, newLabel) {
    const buttons = JSON.parse(localStorage.getItem('buttons'));
    buttons[index].label = newLabel;
    localStorage.setItem('buttons', JSON.stringify(buttons));
}

function addNewButton() {
    const buttons = JSON.parse(localStorage.getItem('buttons')) || [];
    buttons.push({ label: 'כפתור חדש' });
    localStorage.setItem('buttons', JSON.stringify(buttons));
    renderButtons(buttons);
}

function removeButton(index) {
    const buttons = JSON.parse(localStorage.getItem('buttons'));
    buttons.splice(index, 1);
    localStorage.setItem('buttons', JSON.stringify(buttons));
    renderButtons(buttons);
}

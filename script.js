// אתחול של מספר הניקובים מה-Local Storage או ברירת מחדל ל-3
let remainingOrders = localStorage.getItem('remainingOrders') !== null 
    ? parseInt(localStorage.getItem('remainingOrders')) 
    : parseInt(localStorage.getItem('maxOrders')) || 3;

let weeklyBudget = parseFloat(localStorage.getItem('weeklyBudget')) || 0;
let currentSpent = parseFloat(localStorage.getItem('currentSpent')) || 0;

const remainingBudgetDisplay = document.getElementById('remaining-budget-display');
const remainingCount = document.getElementById('remaining-count');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const orderAmount = document.getElementById('order-amount');
const weeklyBudgetDisplay = document.getElementById('weekly-budget-display');
const currentSpentDisplay = document.getElementById('current-spent-display');
const progressBarFill = document.getElementById('progress-fill');
const buttonsContainer = document.getElementById('buttons-container');

let selectedOrderType = '';

// פונקציה לטעינת כפתורים מדף ההגדרות
function loadButtons() {
    const buttons = JSON.parse(localStorage.getItem('buttons')) || [];
    
    // בדיקה אם אין כפתורים שמורים, אל תציג כלום
    if (buttons.length === 0) {
        buttonsContainer.innerHTML = '<p>אין כפתורים זמינים. הגדר כפתורים בהגדרות.</p>';
        return;
    }
    
    buttonsContainer.innerHTML = '';
    buttons.forEach(button => {
        const orderButton = document.createElement('button');
        orderButton.className = 'order-button';
        orderButton.textContent = button.label;
        orderButton.onclick = () => openModal(button.label);
        buttonsContainer.appendChild(orderButton);
    });
}

// פונקציה לאיפוס שבועי ביום ראשון בלבד
function resetWeekly() {
    const now = new Date();
    const lastReset = localStorage.getItem('lastResetDate');
    const currentDay = now.getDay(); // יום ראשון = 0

    if (currentDay === 0) {
        const lastResetDate = new Date(lastReset);
        if (!lastReset || now.toDateString() !== lastResetDate.toDateString()) {
            remainingOrders = parseInt(localStorage.getItem('maxOrders')) || 3;
            localStorage.setItem('remainingOrders', remainingOrders);
            
            currentSpent = 0;
            localStorage.setItem('currentSpent', currentSpent);

            localStorage.setItem('lastResetDate', now.toDateString());
            alert("הניקובים והתקציב התחדשו לשבוע חדש!");
            updateDisplay();
        }
    }
}

// פונקציה לעדכון התצוגה של מספר הניקובים והתקציב
function updateDisplay() {
    remainingCount.textContent = remainingOrders;
    weeklyBudgetDisplay.textContent = weeklyBudget.toFixed(2);
    currentSpentDisplay.textContent = currentSpent.toFixed(2);

    // חישוב הסכום שנותר מתוך התקציב השבועי
    const remainingBudget = weeklyBudget - currentSpent;
    remainingBudgetDisplay.textContent = remainingBudget.toFixed(2);

    // עדכון בר התקדמות
    updateProgressBar();

    // אם נגמרו הניקובים, הצג 0
    if (remainingOrders <= 0) {
        remainingCount.textContent = "0";
    }
}

// פונקציה לעדכון בר התקדמות של התקציב
function updateProgressBar() {
    const percentage = (currentSpent / weeklyBudget) * 100;
    progressBarFill.style.width = `${Math.min(percentage, 100)}%`;
    
    if (currentSpent > weeklyBudget) {
        progressBarFill.style.backgroundColor = 'red';
    } else {
        progressBarFill.style.backgroundColor = '#4CAF50';
    }
}

// פתיחת חלון קופץ להזמנה
window.openModal = function(orderType) {
    if (remainingOrders > 0) {
        selectedOrderType = orderType;
        modalTitle.textContent = `הזמנה ${orderType}`;
        modal.style.display = 'block';
    } else {
        alert("ניצלת את כל ההזמנות לשבוע זה!");
    }
}

// סגירת חלון קופץ
window.closeModal = function() {
    modal.style.display = 'none';
    orderAmount.value = '';
}

// פונקציה לביצוע הזמנה והפחתת ניקוב
window.submitOrder = function() {
    const amount = parseFloat(orderAmount.value);
    if (isNaN(amount) || amount <= 0) {
        alert("נא להזין סכום תקין");
        return;
    }

    if (remainingOrders > 0) {
        remainingOrders--;
        localStorage.setItem('remainingOrders', remainingOrders);

        currentSpent += amount;
        localStorage.setItem('currentSpent', currentSpent);
        
        saveHistory(selectedOrderType, amount);
        updateDisplay();
    }
    closeModal();
}

// שמירת היסטוריית הזמנות
function saveHistory(orderType, amount) {
    const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
    history.push({
        type: orderType,
        amount: amount,
        date: new Date().toLocaleDateString('he-IL')
    });
    localStorage.setItem('orderHistory', JSON.stringify(history));
}

// קריאה לפונקציות בעת טעינת העמוד
document.addEventListener('DOMContentLoaded', () => {
    resetWeekly();
    loadButtons();
    updateDisplay();
});

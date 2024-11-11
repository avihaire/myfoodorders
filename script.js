// אתחול Firebase
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "foodoutside-60619.firebaseapp.com",
    projectId: "foodoutside-60619",
    storageBucket: "foodoutside-60619.appspot.com",
    messagingSenderId: "394412781354",
    appId: "1:394412781354:web:bb6065257d9678c4427853"
};

// אתחול Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let remainingOrders, weeklyBudget, currentSpent, lastResetDate;
const buttonsContainer = document.getElementById('buttons-container');
const progressBarFill = document.getElementById('progress-fill');

// קריאה לנתונים בעת טעינת העמוד
document.addEventListener('DOMContentLoaded', async () => {
    await initializeData();
    await checkResetConditions();
    updateDisplay();
});

// פונקציה לאתחול נתונים בעת טעינת העמוד
async function initializeData() {
    await loadData();
    await loadButtons();
}

// קריאת נתונים מה-Firebase
async function loadData() {
    remainingOrders = await loadFromFirebase('remainingOrders');
    weeklyBudget = await loadFromFirebase('weeklyBudget') || 0;
    currentSpent = await loadFromFirebase('currentSpent') || 0;
    lastResetDate = await loadFromFirebase('lastResetDate');

    // אם אין ערך מוגדר עבור remainingOrders, נאתחל ל-3
    if (remainingOrders === null) {
        remainingOrders = 3;
        await saveToFirebase('remainingOrders', remainingOrders);
    }
}

// שמירת נתונים ל-Firebase
async function saveToFirebase(key, value) {
    try {
        await db.collection('settings').doc(key).set({ value });
    } catch (error) {
        console.error("Error saving to Firebase:", error);
    }
}

// טעינת נתונים מ-Firebase
async function loadFromFirebase(key) {
    try {
        const doc = await db.collection('settings').doc(key).get();
        return doc.exists ? doc.data().value : null;
    } catch (error) {
        console.error("Error loading from Firebase:", error);
        return null;
    }
}

// פונקציה לבדיקה אם יש לאפס את הכרטיסייה ביום ראשון
async function checkResetConditions() {
    const now = new Date();
    const currentDay = now.getDay(); // יום ראשון = 0

    // בדיקה אם היום הוא יום ראשון ואם כבר בוצע איפוס היום
    if (currentDay === 0 && (!lastResetDate || new Date(lastResetDate).toDateString() !== now.toDateString())) {
        await resetWeekly();
    }
}

// פונקציה לאיפוס שבועי
async function resetWeekly() {
    remainingOrders = await loadFromFirebase('maxOrders') || 3;
    currentSpent = 0;

    await saveToFirebase('remainingOrders', remainingOrders);
    await saveToFirebase('currentSpent', currentSpent);
    await saveToFirebase('lastResetDate', new Date().toDateString());

    alert("הכרטיסייה התחדשה לשבוע חדש!");
}

// פונקציה לשימוש ידני באיפוס דרך ההגדרות
window.manualReset = async function () {
    await resetWeekly();
    alert('הכרטיסייה אופסה בהצלחה!');
    window.location.reload();
}

// טעינת כפתורים מה-Firebase
async function loadButtons() {
    const buttons = await loadFromFirebase('buttons') || [];
    renderButtons(buttons);
}

// הצגת הכפתורים בעמוד
function renderButtons(buttons) {
    buttonsContainer.innerHTML = '';

    buttons.forEach(button => {
        const orderButton = document.createElement('button');
        orderButton.className = 'order-button';
        orderButton.textContent = button.label;
        orderButton.onclick = () => openModal(button.label);
        buttonsContainer.appendChild(orderButton);
    });
}

// פונקציה לעדכון התצוגה
function updateDisplay() {
    document.getElementById('remaining-count').textContent = remainingOrders;
    document.getElementById('weekly-budget-display').textContent = weeklyBudget.toFixed(2);
    document.getElementById('current-spent-display').textContent = currentSpent.toFixed(2);
    document.getElementById('remaining-budget-display').textContent = (weeklyBudget - currentSpent).toFixed(2);

    updateProgressBar();
}

// פונקציה לעדכון בר ההתקדמות
function updateProgressBar() {
    const percentage = (currentSpent / weeklyBudget) * 100;
    progressBarFill.style.width = `${Math.min(percentage, 100)}%`;
    progressBarFill.style.backgroundColor = currentSpent > weeklyBudget ? 'red' : '#00B6DB';
}

// פונקציה לשמירת היסטוריית הזמנה
async function saveOrderHistory(orderType, amount) {
    const history = await loadFromFirebase('orderHistory') || [];
    const newEntry = {
        type: orderType,
        amount: amount,
        date: new Date().toLocaleDateString('he-IL')
    };
    history.push(newEntry);
    await saveToFirebase('orderHistory', history);
}

// פונקציות לפתיחת וסגירת מודאל
window.openModal = function (type) {
    const modalTitle = document.getElementById('modal-title');
    const modal = document.getElementById('modal');

    if (modal && modalTitle) {
        modalTitle.textContent = `הזמנה ${type}`;
        modal.classList.add('active');
    }
};

window.closeModal = function () {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('order-amount').value = '';
    }
};

// פונקציה לביצוע הזמנה
window.submitOrder = async function () {
    const amount = parseFloat(document.getElementById('order-amount').value);
    const orderType = document.getElementById('modal-title').textContent;

    if (isNaN(amount) || amount <= 0) return;

    // בדיקה אם נותרו ניקובים
    if (remainingOrders > 0) {
        remainingOrders--;
        currentSpent += amount;

        await saveToFirebase('remainingOrders', remainingOrders);
        await saveToFirebase('currentSpent', currentSpent);
        await saveOrderHistory(orderType, amount);

        updateDisplay();
        closeModal();
    } else {
        alert("אין ניקובים נוספים לשבוע זה.");
        closeModal();
    }
};

// פונקציה לעדכון תאריך ושעה
function updateDateTime() {
    const now = new Date();
    
    // עיצוב התאריך
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = now.toLocaleDateString('he-IL', dateOptions);
    
    // עיצוב השעה
    const formattedTime = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    
    document.getElementById('current-date').textContent = ` ${formattedDate}`;
    document.getElementById('current-time').textContent = ` ${formattedTime}`;
}

// קריאה לפונקציה כל דקה (60,000 מילי-שניות) לעדכון השעה
setInterval(updateDateTime, 1000);
updateDateTime();
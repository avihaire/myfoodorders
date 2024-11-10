// אתחול Firebase
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "foodoutside-60619.firebaseapp.com",
    databaseURL: "https://foodoutside-60619-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "foodoutside-60619",
    storageBucket: "foodoutside-60619.appspot.com",
    messagingSenderId: "394412781354",
    appId: "1:394412781354:web:bb6065257d9678c4427853"
};

// בדוק אם Firebase כבר מאותחל
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// קריאת נתונים מ-Firebase בעת טעינת העמוד
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    await loadButtons();
});

// פונקציה לשמירת נתונים ל-Firebase
async function saveData(key, value) {
    try {
        await db.collection('settings').doc(key).set({ value });
        console.log(`Saved ${key}: ${value}`);
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

// פונקציה לטעינת נתונים מ-Firebase
async function loadData(key) {
    try {
        const doc = await db.collection('settings').doc(key).get();
        return doc.exists ? doc.data().value : null;
    } catch (error) {
        console.error("Error loading data:", error);
        return null;
    }
}

// טעינת ההגדרות
async function loadSettings() {
    const maxOrders = await loadData('maxOrders') || 3;
    const weeklyBudget = await loadData('weeklyBudget') || 0;

    document.getElementById('max-orders').value = maxOrders;
    document.getElementById('weekly-budget').value = weeklyBudget;
}

// שמירת כמות הניקובים בהגדרות
window.saveMaxOrders = async function() {
    const maxOrders = parseInt(document.getElementById('max-orders').value);

    if (isNaN(maxOrders) || maxOrders <= 0) {
        alert("נא להזין מספר תקין");
        return;
    }

    await saveData('maxOrders', maxOrders);
    await saveData('remainingOrders', maxOrders);
    alert('כמות הניקובים נשמרה בהצלחה!');
    window.location.reload();
};

// שמירת הסכום השבועי
window.saveWeeklyBudget = async function() {
    const weeklyBudget = parseFloat(document.getElementById('weekly-budget').value);
    if (isNaN(weeklyBudget) || weeklyBudget < 0) {
        alert("נא להזין סכום תקין");
        return;
    }

    await saveData('weeklyBudget', weeklyBudget);
    await saveData('currentSpent', 0);
    alert('הסכום השבועי נשמר בהצלחה!');
    window.location.reload();
};

// טעינת כפתורים מ-Firebase
async function loadButtons() {
    const buttons = await loadData('buttons') || [];
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
}

// פונקציה לעדכון שם הכפתור
window.updateButtonLabel = async function(index, newLabel) {
    const buttons = await loadData('buttons') || [];
    buttons[index].label = newLabel;
    await saveData('buttons', buttons);
    renderButtons(buttons);
};

// פונקציה להוספת כפתור חדש
window.addNewButton = async function() {
    const buttons = await loadData('buttons') || [];
    buttons.push({ label: 'כפתור חדש' });
    await saveData('buttons', buttons);
    renderButtons(buttons);
};

// פונקציה למחיקת כפתור
window.removeButton = async function(index) {
    const buttons = await loadData('buttons') || [];
    buttons.splice(index, 1);
    await saveData('buttons', buttons);
    renderButtons(buttons);
};

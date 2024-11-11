// אתחול של Firebase
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

// קריאה לפונקציה בעת טעינת העמוד
document.addEventListener('DOMContentLoaded', loadOrderHistory);

// פונקציה להצגת היסטוריית הזמנות
async function loadOrderHistory() {
    const history = await loadFromFirebase('orderHistory') || [];
    const historyTable = document.getElementById('history-table');
    
    // נקה את הטבלה והוסף כותרות
    historyTable.innerHTML = `
        <tr>
            <th>תאריך</th>
            <th>שעה</th>
            <th>סוג הזמנה</th>
            <th>סכום</th>
            <th>תיאור</th>
        </tr>
    `;

    // בדוק אם ההיסטוריה ריקה
    if (history.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" style="text-align: center;">אין היסטוריית הזמנות</td>`;
        historyTable.appendChild(row);
        return;
    }

    // עבור על כל רשומה בהיסטוריה והוסף לטבלה
    history.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date || ''}</td>
            <td>${entry.time || ''}</td>
            <td>${entry.type || ''}</td>
            <td>${entry.amount ? entry.amount.toFixed(2) + ' ₪' : ''}</td>
            <td>${entry.description || ''}</td>
        `;
        historyTable.appendChild(row);
    });
}

// טעינת נתונים מ-Firebase
async function loadFromFirebase(key) {
    try {
        const doc = await db.collection('settings').doc(key).get();
        return doc.exists ? doc.data().value : [];
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

// מחיקת ההיסטוריה
async function clearHistory() {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל ההיסטוריה?')) {
        try {
            await db.collection('settings').doc('orderHistory').delete();
            location.reload();
        } catch (error) {
            console.error("Error clearing history:", error);
        }
    }
}

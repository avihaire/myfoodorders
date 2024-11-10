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

document.addEventListener('DOMContentLoaded', loadHistory);

// טעינת ההיסטוריה מה-Firebase והצגתה בטבלה
async function loadHistory() {
    const history = await loadFromFirebase('orderHistory') || [];
    const table = document.getElementById('history-table');

    table.innerHTML = `
        <tr>
            <th>תאריך</th>
            <th>סוג הזמנה</th>
            <th>סכום</th>
        </tr>
    `;

    history.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${entry.date}</td><td>${entry.type}</td><td>${entry.amount} ₪</td>`;
        table.appendChild(row);
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

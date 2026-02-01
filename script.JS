// Initialize database
function initDatabase() {
if (!localStorage.getItem(‘users’)) {
localStorage.setItem(‘users’, JSON.stringify({}));
}
if (!localStorage.getItem(‘transactions’)) {
localStorage.setItem(‘transactions’, JSON.stringify([]));
}
if (!localStorage.getItem(‘creditRequests’)) {
localStorage.setItem(‘creditRequests’, JSON.stringify([]));
}
if (!localStorage.getItem(‘atmRequests’)) {
localStorage.setItem(‘atmRequests’, JSON.stringify([]));
}
}

// Current user session
let currentUser = null;
let isAdmin = false;

// Notification system
function showNotification(message, type = ‘success’) {
const notification = document.getElementById(‘notification’);
notification.textContent = message;
notification.className = `notification ${type} show`;

```
setTimeout(() => {
    notification.classList.remove('show');
}, 3000);
```

}

// Page navigation
function showPage(pageId) {
document.querySelectorAll(’.page’).forEach(page => {
page.classList.remove(‘active’);
});

```
const targetPage = document.getElementById(`${pageId}-page`);
if (targetPage) {
    targetPage.classList.add('active');
}

// Update page-specific content
if (pageId === 'dashboard' && currentUser) {
    updateDashboard();
} else if (pageId === 'admin' && isAdmin) {
    updateAdminPanel();
} else if (pageId === 'atm') {
    updateATMRequests();
}
```

}

// User registration
function showRegister() {
const username = prompt(‘Введите имя пользователя для регистрации:’);
if (!username) return;

```
const password = prompt('Введите пароль:');
if (!password) return;

const users = JSON.parse(localStorage.getItem('users'));

if (users[username]) {
    showNotification('Пользователь уже существует!', 'error');
    return;
}

users[username] = {
    password: password,
    balance: 10000, // Starting balance
    createdAt: new Date().toISOString()
};

localStorage.setItem('users', JSON.stringify(users));
showNotification('Регистрация успешна! Теперь можете войти.', 'success');
```

}

// User login
document.getElementById(‘login-form’).addEventListener(‘submit’, (e) => {
e.preventDefault();

```
const username = document.getElementById('username').value;
const password = document.getElementById('password').value;

const users = JSON.parse(localStorage.getItem('users'));

if (users[username] && users[username].password === password) {
    currentUser = username;
    showNotification(`Добро пожаловать, ${username}!`, 'success');
    showPage('dashboard');
    document.getElementById('login-form').reset();
} else {
    showNotification('Неверное имя пользователя или пароль!', 'error');
}
```

});

// Logout
function logout() {
currentUser = null;
showNotification(‘Вы вышли из системы’, ‘success’);
showPage(‘home’);
}

// Update dashboard
function updateDashboard() {
if (!currentUser) return;

```
const users = JSON.parse(localStorage.getItem('users'));
const balance = users[currentUser].balance;

document.getElementById('user-balance').textContent = balance.toFixed(2);

// Update transactions
const transactions = JSON.parse(localStorage.getItem('transactions'));
const userTransactions = transactions.filter(t => 
    t.from === currentUser || t.to === currentUser
);

const transactionsList = document.getElementById('transactions-list');

if (userTransactions.length === 0) {
    transactionsList.innerHTML = '<p style="color: var(--text-gray);">Нет транзакций</p>';
} else {
    transactionsList.innerHTML = userTransactions
        .slice(-10)
        .reverse()
        .map(t => {
            const isIncoming = t.to === currentUser;
            const amount = isIncoming ? `+${t.amount}` : `-${t.amount}`;
            const amountClass = isIncoming ? 'positive' : 'negative';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-type">${t.type}</div>
                        <div class="transaction-date">${new Date(t.date).toLocaleString('ru-RU')}</div>
                    </div>
                    <div class="transaction-amount ${amountClass}">${amount} ₽</div>
                </div>
            `;
        }).join('');
}
```

}

// Transfer modal
function showTransferModal() {
document.getElementById(‘transfer-modal’).classList.add(‘active’);
}

function closeModal(modalId) {
document.getElementById(modalId).classList.remove(‘active’);
}

// Transfer form
document.getElementById(‘transfer-form’).addEventListener(‘submit’, (e) => {
e.preventDefault();

```
const recipient = document.getElementById('transfer-recipient').value;
const amount = parseFloat(document.getElementById('transfer-amount').value);

const users = JSON.parse(localStorage.getItem('users'));

if (!users[recipient]) {
    showNotification('Получатель не найден!', 'error');
    return;
}

if (users[currentUser].balance < amount) {
    showNotification('Недостаточно средств!', 'error');
    return;
}

// Execute transfer
users[currentUser].balance -= amount;
users[recipient].balance += amount;
localStorage.setItem('users', JSON.stringify(users));

// Add transaction
const transactions = JSON.parse(localStorage.getItem('transactions'));
transactions.push({
    id: Date.now(),
    type: 'Перевод',
    from: currentUser,
    to: recipient,
    amount: amount,
    date: new Date().toISOString()
});
localStorage.setItem('transactions', JSON.stringify(transactions));

showNotification(`Перевод ${amount} ₽ для ${recipient} выполнен!`, 'success');
closeModal('transfer-modal');
document.getElementById('transfer-form').reset();
updateDashboard();
```

});

// Credit modal
function showCreditModal() {
document.getElementById(‘credit-modal’).classList.add(‘active’);
}

// Credit form
document.getElementById(‘credit-form’).addEventListener(‘submit’, (e) => {
e.preventDefault();

```
const amount = parseFloat(document.getElementById('credit-amount').value);
const term = parseInt(document.getElementById('credit-term').value);

const creditRequests = JSON.parse(localStorage.getItem('creditRequests'));

creditRequests.push({
    id: Date.now(),
    username: currentUser,
    amount: amount,
    term: term,
    status: 'pending',
    date: new Date().toISOString()
});

localStorage.setItem('creditRequests', JSON.stringify(creditRequests));

showNotification('Заявка на кредит отправлена! Ожидайте одобрения.', 'warning');
closeModal('credit-modal');
document.getElementById('credit-form').reset();
```

});

// ATM form
document.getElementById(‘atm-form’).addEventListener(‘submit’, (e) => {
e.preventDefault();

```
const username = document.getElementById('atm-username').value;
const amount = parseFloat(document.getElementById('atm-amount').value);

const users = JSON.parse(localStorage.getItem('users'));

if (!users[username]) {
    showNotification('Пользователь не найден!', 'error');
    return;
}

if (users[username].balance < amount) {
    showNotification('Недостаточно средств на счете!', 'error');
    return;
}

const atmRequests = JSON.parse(localStorage.getItem('atmRequests'));

atmRequests.push({
    id: Date.now(),
    username: username,
    amount: amount,
    status: 'pending',
    date: new Date().toISOString()
});

localStorage.setItem('atmRequests', JSON.stringify(atmRequests));

showNotification('Заявка на вывод отправлена! Статус: Ожидание', 'warning');
document.getElementById('atm-form').reset();
updateATMRequests();
```

});

// Update ATM requests
function updateATMRequests() {
const atmRequests = JSON.parse(localStorage.getItem(‘atmRequests’));
const requestsList = document.getElementById(‘atm-requests-list’);

```
if (atmRequests.length === 0) {
    requestsList.innerHTML = '<p style="color: var(--text-gray);">Нет заявок</p>';
    return;
}

requestsList.innerHTML = atmRequests
    .slice(-10)
    .reverse()
    .map(req => `
        <div class="request-item">
            <div>
                <div><strong>${req.username}</strong></div>
                <div style="color: var(--text-gray);">${req.amount} ₽</div>
                <div style="color: var(--text-gray); font-size: 0.85rem;">
                    ${new Date(req.date).toLocaleString('ru-RU')}
                </div>
            </div>
            <span class="request-status ${req.status}">
                ${req.status === 'pending' ? 'Ожидание' : 
                  req.status === 'approved' ? 'Одобрено' : 'Отклонено'}
            </span>
        </div>
    `).join('');
```

}

// Admin login
document.getElementById(‘admin-login-form’).addEventListener(‘submit’, (e) => {
e.preventDefault();

```
const username = document.getElementById('admin-username').value;
const password = document.getElementById('admin-password').value;

if (username === 'admin' && password === 'admin') {
    isAdmin = true;
    showNotification('Вход в админ-панель выполнен!', 'success');
    showPage('admin');
    document.getElementById('admin-login-form').reset();
} else {
    showNotification('Неверные учетные данные администратора!', 'error');
}
```

});

// Admin logout
function adminLogout() {
isAdmin = false;
showNotification(‘Выход из админ-панели’, ‘success’);
showPage(‘home’);
}

// Switch admin tabs
function switchAdminTab(tab) {
document.querySelectorAll(’.tab-btn’).forEach(btn => {
btn.classList.remove(‘active’);
});
document.querySelectorAll(’.admin-tab’).forEach(tabContent => {
tabContent.classList.remove(‘active’);
});

```
event.target.classList.add('active');
document.getElementById(`admin-${tab}-tab`).classList.add('active');
```

}

// Update admin panel
function updateAdminPanel() {
updateAdminCredits();
updateAdminATM();
}

// Update admin credits
function updateAdminCredits() {
const creditRequests = JSON.parse(localStorage.getItem(‘creditRequests’));
const creditsList = document.getElementById(‘admin-credits-list’);

```
const pendingRequests = creditRequests.filter(req => req.status === 'pending');

if (pendingRequests.length === 0) {
    creditsList.innerHTML = '<p style="color: var(--text-gray);">Нет заявок на кредит</p>';
    return;
}

creditsList.innerHTML = pendingRequests.map(req => `
    <div class="admin-request">
        <div class="request-header">
            <span class="request-user">${req.username}</span>
            <span style="color: var(--text-gray);">${new Date(req.date).toLocaleString('ru-RU')}</span>
        </div>
        <div class="request-details">
            <div>Сумма: <strong>${req.amount} ₽</strong></div>
            <div>Срок: <strong>${req.term} месяцев</strong></div>
        </div>
        <div class="request-actions">
            <button class="approve-btn" onclick="approveCredit(${req.id})">Подтвердить</button>
            <button class="reject-btn" onclick="rejectCredit(${req.id})">Отклонить</button>
        </div>
    </div>
`).join('');
```

}

// Update admin ATM
function updateAdminATM() {
const atmRequests = JSON.parse(localStorage.getItem(‘atmRequests’));
const atmList = document.getElementById(‘admin-atm-list’);

```
const pendingRequests = atmRequests.filter(req => req.status === 'pending');

if (pendingRequests.length === 0) {
    atmList.innerHTML = '<p style="color: var(--text-gray);">Нет заявок на вывод</p>';
    return;
}

atmList.innerHTML = pendingRequests.map(req => `
    <div class="admin-request">
        <div class="request-header">
            <span class="request-user">${req.username}</span>
            <span style="color: var(--text-gray);">${new Date(req.date).toLocaleString('ru-RU')}</span>
        </div>
        <div class="request-details">
            <div>Сумма вывода: <strong>${req.amount} ₽</strong></div>
        </div>
        <div class="request-actions">
            <button class="approve-btn" onclick="approveATM(${req.id})">Подтвердить</button>
            <button class="reject-btn" onclick="rejectATM(${req.id})">Отклонить</button>
        </div>
    </div>
`).join('');
```

}

// Approve credit
function approveCredit(requestId) {
const creditRequests = JSON.parse(localStorage.getItem(‘creditRequests’));
const request = creditRequests.find(req => req.id === requestId);

```
if (!request) return;

// Update user balance
const users = JSON.parse(localStorage.getItem('users'));
users[request.username].balance += request.amount;
localStorage.setItem('users', JSON.stringify(users));

// Update request status
request.status = 'approved';
localStorage.setItem('creditRequests', JSON.stringify(creditRequests));

// Add transaction
const transactions = JSON.parse(localStorage.getItem('transactions'));
transactions.push({
    id: Date.now(),
    type: 'Кредит одобрен',
    from: 'Банк',
    to: request.username,
    amount: request.amount,
    date: new Date().toISOString()
});
localStorage.setItem('transactions', JSON.stringify(transactions));

showNotification(`Кредит ${request.amount} ₽ одобрен для ${request.username}!`, 'success');
updateAdminPanel();
```

}

// Reject credit
function rejectCredit(requestId) {
const creditRequests = JSON.parse(localStorage.getItem(‘creditRequests’));
const request = creditRequests.find(req => req.id === requestId);

```
if (!request) return;

request.status = 'rejected';
localStorage.setItem('creditRequests', JSON.stringify(creditRequests));

showNotification(`Кредит для ${request.username} отклонен`, 'error');
updateAdminPanel();
```

}

// Approve ATM withdrawal
function approveATM(requestId) {
const atmRequests = JSON.parse(localStorage.getItem(‘atmRequests’));
const request = atmRequests.find(req => req.id === requestId);

```
if (!request) return;

// Update user balance
const users = JSON.parse(localStorage.getItem('users'));
users[request.username].balance -= request.amount;
localStorage.setItem('users', JSON.stringify(users));

// Update request status
request.status = 'approved';
localStorage.setItem('atmRequests', JSON.stringify(atmRequests));

// Add transaction
const transactions = JSON.parse(localStorage.getItem('transactions'));
transactions.push({
    id: Date.now(),
    type: 'Вывод через банкомат',
    from: request.username,
    to: 'Банкомат',
    amount: request.amount,
    date: new Date().toISOString()
});
localStorage.setItem('transactions', JSON.stringify(transactions));

showNotification(`Вывод ${request.amount} ₽ одобрен для ${request.username}!`, 'success');
updateAdminPanel();
```

}

// Reject ATM withdrawal
function rejectATM(requestId) {
const atmRequests = JSON.parse(localStorage.getItem(‘atmRequests’));
const request = atmRequests.find(req => req.id === requestId);

```
if (!request) return;

request.status = 'rejected';
localStorage.setItem('atmRequests', JSON.stringify(atmRequests));

showNotification(`Вывод для ${request.username} отклонен`, 'error');
updateAdminPanel();
```

}

// Close modal when clicking outside
window.onclick = function(event) {
if (event.target.classList.contains(‘modal’)) {
event.target.classList.remove(‘active’);
}
}

// Initialize on page load
document.addEventListener(‘DOMContentLoaded’, () => {
initDatabase();
showPage(‘home’);
});

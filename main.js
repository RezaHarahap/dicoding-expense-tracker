/** Expense Tracker App — Muhammad Reza Pahlevi Harahap */

const STORAGE_KEY = 'REZA_EXPENSE_TRACKER_TRANSACTIONS';
const TRANSACTION_UPDATED_EVENT = 'transaction:updated';

let transactions = loadTransactions();
let editingTransactionId = null;
let searchKeyword = '';

const transactionForm = document.getElementById('transactionForm');
const titleInput = document.getElementById('transactionFormTitleInput');
const amountInput = document.getElementById('transactionFormAmountInput');
const dateInput = document.getElementById('transactionFormDateInput');
const typeSelect = document.getElementById('transactionFormTypeSelect');
const submitButton = transactionForm.querySelector('[data-testid="transactionFormSubmitButton"]');
const formHeading = document.getElementById('form-heading');
const searchForm = document.getElementById('searchTransactionForm');
const searchInput = document.getElementById('searchTransactionFormTitleInput');
const incomeList = document.getElementById('incomeList');
const expenseList = document.getElementById('expenseList');
const balanceElement = document.querySelector('.tracker-summary__balance-amount');
const incomeElement = document.querySelector('.tracker-summary__stat-amount--income');
const expenseElement = document.querySelector('.tracker-summary__stat-amount--expense');

function loadTransactions() {
  try {
    const savedTransactions = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTransactions) ? savedTransactions : [];
  } catch (error) {
    console.warn('Data tersimpan tidak dapat dibaca.', error);
    return [];
  }
}

function saveTransactions() { localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions)); }
function dispatchTransactionUpdated() { document.dispatchEvent(new Event(TRANSACTION_UPDATED_EVENT)); }
function commitTransactionChange() { saveTransactions(); dispatchTransactionUpdated(); }

function generateId() {
  let id = +new Date();
  while (transactions.some((transaction) => transaction.id === id)) id += 1;
  return id;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
}

function createTextElement(tagName, testId, text, className) {
  const element = document.createElement(tagName);
  element.setAttribute('data-testid', testId);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function createActionButton(label, className, onClick, testId) {
  const button = document.createElement('button');
  button.type = 'button'; button.textContent = label;
  button.className = `tracker-transaction-item__btn ${className}`;
  if (testId) button.setAttribute('data-testid', testId);
  button.addEventListener('click', onClick);
  return button;
}

function createTransactionItem(transaction) {
  const item = document.createElement('div');
  item.setAttribute('data-testid', 'transactionItem');
  item.className = 'tracker-transaction-item';
  const icon = document.createElement('div');
  icon.className = `tracker-transaction-item__icon tracker-transaction-item__icon--${transaction.type}`;
  icon.textContent = transaction.type === 'income' ? '↗' : '↘'; icon.setAttribute('aria-hidden', 'true');
  const detail = document.createElement('div'); detail.className = 'tracker-transaction-item__detail';
  detail.append(
    createTextElement('h3', 'transactionItemTitle', transaction.title, 'tracker-transaction-item__title'),
    createTextElement('p', 'transactionItemDate', `Tanggal: ${transaction.date}`, 'tracker-transaction-item__date'),
    createTextElement('p', 'transactionItemType', `Tipe: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`, 'tracker-transaction-item__type'),
  );
  const right = document.createElement('div'); right.className = 'tracker-transaction-item__right';
  const amount = createTextElement('p', 'transactionItemAmount', `Nominal: Rp${transaction.amount}`, `tracker-transaction-item__amount tracker-transaction-item__amount--${transaction.type}`);
  const actions = document.createElement('div'); actions.className = 'tracker-transaction-item__actions';
  actions.append(
    createActionButton('Edit', 'tracker-transaction-item__btn--edit', () => startEditing(transaction.id)),
    createActionButton('Ubah Tipe', 'tracker-transaction-item__btn--switch', () => toggleTransactionType(transaction.id), 'transactionItemEditTypeButton'),
    createActionButton('Hapus', 'tracker-transaction-item__btn--delete', () => deleteTransaction(transaction.id), 'transactionItemDeleteButton'),
  );
  right.append(amount, actions); item.append(icon, detail, right); return item;
}

function createEmptyMessage(message) {
  const emptyMessage = document.createElement('p');
  emptyMessage.className = 'tracker-transaction-list__empty'; emptyMessage.textContent = message; return emptyMessage;
}

function renderTransactions() {
  incomeList.replaceChildren(); expenseList.replaceChildren();
  const visibleTransactions = transactions.filter((transaction) => transaction.title.toLowerCase().includes(searchKeyword));
  visibleTransactions.forEach((transaction) => (transaction.type === 'income' ? incomeList : expenseList).append(createTransactionItem(transaction)));
  if (!visibleTransactions.some((item) => item.type === 'income')) incomeList.append(createEmptyMessage(searchKeyword ? 'Pemasukan tidak ditemukan.' : 'Belum ada pemasukan.'));
  if (!visibleTransactions.some((item) => item.type === 'expense')) expenseList.append(createEmptyMessage(searchKeyword ? 'Pengeluaran tidak ditemukan.' : 'Belum ada pengeluaran.'));
}

function updateDashboard() {
  const totalIncome = transactions.filter((item) => item.type === 'income').reduce((total, item) => total + item.amount, 0);
  const totalExpense = transactions.filter((item) => item.type === 'expense').reduce((total, item) => total + item.amount, 0);
  const balance = totalIncome - totalExpense;
  incomeElement.textContent = formatCurrency(totalIncome); expenseElement.textContent = formatCurrency(totalExpense); balanceElement.textContent = formatCurrency(balance);
  balanceElement.classList.toggle('tracker-summary__balance-amount--negative', balance < 0);
}

function resetTransactionForm() {
  editingTransactionId = null; transactionForm.reset(); dateInput.value = new Date().toISOString().split('T')[0];
  formHeading.textContent = 'Tambah Pencatatan Baru'; submitButton.textContent = 'Simpan Transaksi';
}

function startEditing(id) {
  const transaction = transactions.find((item) => item.id === id); if (!transaction) return;
  editingTransactionId = id; titleInput.value = transaction.title; amountInput.value = transaction.amount; dateInput.value = transaction.date; typeSelect.value = transaction.type;
  formHeading.textContent = 'Edit Pencatatan'; submitButton.textContent = 'Simpan Perubahan'; titleInput.focus();
  transactionForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  if (editingTransactionId === id) resetTransactionForm(); commitTransactionChange();
}

function toggleTransactionType(id) {
  transactions = transactions.map((transaction) => transaction.id === id ? { ...transaction, type: transaction.type === 'income' ? 'expense' : 'income' } : transaction);
  commitTransactionChange();
}

transactionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim(); const amount = Number(amountInput.value); const date = dateInput.value; const type = typeSelect.value;
  if (!title) { alert('Judul transaksi tidak boleh kosong.'); titleInput.focus(); return; }
  if (!Number.isFinite(amount) || amount < 1) { alert('Nominal transaksi harus minimal 1 rupiah.'); amountInput.focus(); return; }
  if (!date) { alert('Tanggal transaksi wajib diisi.'); dateInput.focus(); return; }
  if (editingTransactionId !== null) transactions = transactions.map((transaction) => transaction.id === editingTransactionId ? { ...transaction, title, amount, date, type } : transaction);
  else transactions.push({ id: generateId(), title, amount, date, type });
  resetTransactionForm(); commitTransactionChange();
});

searchInput.addEventListener('input', () => { searchKeyword = searchInput.value.trim().toLowerCase(); renderTransactions(); });
searchForm.addEventListener('submit', (event) => { event.preventDefault(); searchKeyword = searchInput.value.trim().toLowerCase(); renderTransactions(); });
document.addEventListener(TRANSACTION_UPDATED_EVENT, () => { renderTransactions(); updateDashboard(); });
resetTransactionForm(); dispatchTransactionUpdated();

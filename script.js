const form = document.getElementById("budgetForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const transactionList = document.getElementById("transactionList");
const categoryList = document.getElementById("categoryList");
const incomeAmount = document.getElementById("incomeAmount");
const expenseAmount = document.getElementById("expenseAmount");
const balanceAmount = document.getElementById("balanceAmount");
const balanceStatus = document.getElementById("balanceStatus");
const transactionCount = document.getElementById("transactionCount");
const clearAllButton = document.getElementById("clearAll");

const storageKey = "personal-budget-planner";
let transactions = JSON.parse(localStorage.getItem(storageKey)) || [];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function saveTransactions() {
  localStorage.setItem(storageKey, JSON.stringify(transactions));
}

function updateSummary() {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;

  incomeAmount.textContent = formatCurrency(income);
  expenseAmount.textContent = formatCurrency(expenses);
  balanceAmount.textContent = formatCurrency(balance);
  transactionCount.textContent = transactions.length;

  if (transactions.length === 0) {
    balanceStatus.textContent = "Start by adding a transaction.";
  } else if (balance > 0) {
    balanceStatus.textContent = "You are staying ahead this month.";
  } else if (balance < 0) {
    balanceStatus.textContent = "Your spending is above your income.";
  } else {
    balanceStatus.textContent = "Your budget is perfectly balanced.";
  }
}

function renderCategories() {
  if (transactions.length === 0) {
    categoryList.innerHTML = '<li class="empty-state">No categories to show yet.</li>';
    return;
  }

  const totals = transactions.reduce((accumulator, item) => {
    const sign = item.type === "expense" ? -1 : 1;
    accumulator[item.category] = (accumulator[item.category] || 0) + item.amount * sign;
    return accumulator;
  }, {});

  categoryList.innerHTML = Object.entries(totals)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .map(([category, total]) => `
      <li>
        <span>${category}</span>
        <strong class="${total >= 0 ? "amount-income" : "amount-expense"}">${formatCurrency(total)}</strong>
      </li>
    `)
    .join("");
}

function renderTransactions() {
  if (transactions.length === 0) {
    transactionList.innerHTML = `
      <tr>
        <td class="empty-state" colspan="5">No transactions added yet.</td>
      </tr>
    `;
    return;
  }

  transactionList.innerHTML = transactions
    .map((item) => `
      <tr>
        <td>${item.title}</td>
        <td>${item.category}</td>
        <td><span class="type-chip ${item.type}">${item.type}</span></td>
        <td class="${item.type === "income" ? "amount-income" : "amount-expense"}">
          ${item.type === "income" ? "+" : "-"}${formatCurrency(item.amount)}
        </td>
        <td>
          <button class="delete-button" type="button" onclick="deleteTransaction('${item.id}')">Delete</button>
        </td>
      </tr>
    `)
    .join("");
}

function refreshUI() {
  renderTransactions();
  renderCategories();
  updateSummary();
  saveTransactions();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);

  if (!title || amount <= 0) {
    return;
  }

  transactions.unshift({
    id: crypto.randomUUID(),
    title,
    amount,
    type: typeInput.value,
    category: categoryInput.value
  });

  form.reset();
  typeInput.value = "income";
  categoryInput.value = "Salary";
  refreshUI();
});

function deleteTransaction(id) {
  transactions = transactions.filter((item) => item.id !== id);
  refreshUI();
}

clearAllButton.addEventListener("click", () => {
  transactions = [];
  refreshUI();
});

refreshUI();
import { useEffect, useState } from "react";

const STORAGE_KEY = "react-budget-planner-data";

const defaultCategories = [
  "Salary",
  "Freelance",
  "Food",
  "Transport",
  "Rent",
  "Bills",
  "Shopping",
  "Health",
  "Savings",
  "Other"
];

const initialForm = {
  title: "",
  amount: "",
  type: "income",
  category: "Salary"
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

function getCurrentMonthLabel() {
  return new Date().toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });
}

function getSavedData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return {
      monthlyLimit: 25000,
      transactions: []
    };
  }

  try {
    return JSON.parse(savedData);
  } catch {
    return {
      monthlyLimit: 25000,
      transactions: []
    };
  }
}

export default function App() {
  const [formData, setFormData] = useState(initialForm);
  const [monthlyLimit, setMonthlyLimit] = useState(25000);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const saved = getSavedData();
    setMonthlyLimit(saved.monthlyLimit || 25000);
    setTransactions(saved.transactions || []);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        monthlyLimit,
        transactions
      })
    );
  }, [monthlyLimit, transactions]);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expenses;
  const spendingPercent = monthlyLimit > 0 ? Math.min((expenses / monthlyLimit) * 100, 100) : 0;

  const categoryTotals = transactions.reduce((accumulator, item) => {
    if (item.type !== "expense") {
      return accumulator;
    }

    accumulator[item.category] = (accumulator[item.category] || 0) + item.amount;
    return accumulator;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(formData.amount);
    const title = formData.title.trim();

    if (!title || amount <= 0) {
      return;
    }

    setTransactions((current) => [
      {
        id: crypto.randomUUID(),
        title,
        amount,
        type: formData.type,
        category: formData.category,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);

    setFormData(initialForm);
  }

  function deleteTransaction(id) {
    setTransactions((current) => current.filter((item) => item.id !== id));
  }

  function clearAllTransactions() {
    setTransactions([]);
  }

  const budgetMessage =
    expenses === 0
      ? "No expenses added yet."
      : expenses > monthlyLimit
        ? "Monthly budget limit exceeded."
        : expenses > monthlyLimit * 0.8
          ? "You are close to your monthly budget limit."
          : "Your spending is within the monthly budget limit.";

  return (
    <div className="page-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />

      <main className="container">
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow">React Finance Dashboard</p>
            <h1>Personal Budget Planner</h1>
            <p className="subtitle">
              Track income and expenses, monitor category-wise spending, and keep your monthly budget under control.
            </p>
          </div>

          <div className="hero-card">
            <span className="hero-label">{getCurrentMonthLabel()}</span>
            <h2>{formatCurrency(balance)}</h2>
            <p className="hero-note">
              {balance >= 0 ? "Available balance after expenses" : "You are overspending this month"}
            </p>
          </div>
        </header>

        <section className="dashboard-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-tag">Add Entry</p>
                <h3>Add Transaction</h3>
              </div>
            </div>

            <form className="budget-form" onSubmit={handleSubmit}>
              <label>
                Title
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Salary, Rent, Grocery bill"
                  required
                />
              </label>

              <label>
                Amount
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label>
                Type
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>

              <label>
                Category
                <select name="category" value={formData.category} onChange={handleChange}>
                  {defaultCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" className="primary-button">
                Add Transaction
              </button>
            </form>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="section-tag">Monthly Control</p>
                <h3>Budget Overview</h3>
              </div>
            </div>

            <div className="summary-grid">
              <article className="summary-card income">
                <span>Total Income</span>
                <strong>{formatCurrency(income)}</strong>
              </article>

              <article className="summary-card expense">
                <span>Total Expenses</span>
                <strong>{formatCurrency(expenses)}</strong>
              </article>

              <article className="summary-card balance">
                <span>Total Balance</span>
                <strong>{formatCurrency(balance)}</strong>
              </article>
            </div>

            <div className="limit-box">
              <div className="limit-head">
                <div>
                  <h4>Monthly Budget Limit</h4>
                  <p>{budgetMessage}</p>
                </div>
                <input
                  className="limit-input"
                  type="number"
                  min="0"
                  step="100"
                  value={monthlyLimit}
                  onChange={(event) => setMonthlyLimit(Number(event.target.value) || 0)}
                />
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${spendingPercent}%` }} />
              </div>

              <div className="limit-meta">
                <span>Used: {formatCurrency(expenses)}</span>
                <span>Limit: {formatCurrency(monthlyLimit)}</span>
              </div>
            </div>

            <div className="category-panel">
              <div className="inline-header">
                <h4>Category-wise Expenses</h4>
                <button type="button" className="secondary-button" onClick={clearAllTransactions}>
                  Clear All
                </button>
              </div>

              {sortedCategories.length === 0 ? (
                <p className="empty-state">No expense categories available yet.</p>
              ) : (
                <div className="category-list">
                  {sortedCategories.map(([category, total]) => (
                    <div className="category-row" key={category}>
                      <span>{category}</span>
                      <strong>{formatCurrency(total)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="panel transaction-panel">
          <div className="panel-heading">
            <div>
              <p className="section-tag">History</p>
              <h3>Recent Transactions</h3>
            </div>
            <span className="count-badge">{transactions.length} entries</span>
          </div>

          {transactions.length === 0 ? (
            <p className="empty-state">No transactions added yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`type-chip ${item.type}`}>{item.type}</span>
                      </td>
                      <td className={item.type === "income" ? "amount-income" : "amount-expense"}>
                        {item.type === "income" ? "+" : "-"}
                        {formatCurrency(item.amount)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteTransaction(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
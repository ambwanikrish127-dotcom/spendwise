# 💰 SpendWise — Premium React Expense Tracker

A modern, fast, and responsive personal finance tracker rebuilt with **React 18** and **Vite**.

## ✨ Features

- **Dashboard View** — Total income, expenses, and net balance (auto-adjusts color based on profit/loss) along with a quick-glance list of the 5 most recent transactions.
- **Transactions View** — Full search (title, notes, categories, payment methods) and multiple filters (type pills, category dropdown, start/end dates) with pagination and dynamic totals.
- **Reports View** — Custom date range filters, total savings calculation, interactive category-wise spending progress bars (based on maximum expense), and monthly breakdown lists.
- **Local Storage Sync** — Automatically preserves and loads transactions between refreshes.
- **CSV Export** — Download your currently filtered transactions list with a single click.
- **Design & UX** — Google Fonts (Inter), glassmorphism cards, micro-interactions, responsive sidebars, custom-drawn SVG icons, and a premium color palette.

---

## 🚀 Getting Started

Follow these steps to run the application locally:

### 1. Install Dependencies
Run the following command in the root folder to install all required packages (including React and Lucide Icons):
```bash
npm install
```

### 2. Start the Development Server
Launch the Vite development server:
```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000) and open automatically in your browser.

---

## 📁 Project Structure

```
SpendWise/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx            # Left-panel navigations
│   │   ├── Dashboard.jsx          # Statistics & Recent Items
│   │   ├── Transactions.jsx       # Grid list, Search, Filters, CSV Export
│   │   ├── Reports.jsx           # Charts & Month-on-month breakdown
│   │   └── TransactionModal.jsx   # Create/Edit validated form dialog
│   ├── App.jsx                    # Top-level state coordinator & sync
│   ├── main.jsx                   # React bootloader script
│   └── index.css                  # UI Design System & component styles
├── index.html                     # HTML root template
├── package.json                   # Configurations & Dependencies
├── vite.config.js                 # Vite bundling setup
└── README.md                      # Documentation
```

## 🛠 Tech Stack

- **React 18** (Components, custom hooks, memoization)
- **Vite** (Next-generation front-end tooling)
- **Lucide React** (Vector iconography)
- **Vanilla CSS3** (Custom design tokens, Flexbox/Grid, and responsive media query support)

# Finance Dashboard

A simple, interactive finance dashboard built for a frontend assignment.

The goal of this project is to show clean UI design, clear component structure, and good state handling. It is frontend-only and uses mock data with local storage.

## What This Project Does

- Shows a financial overview with balance, income, and expenses cards.
- Visualizes data with:
  - a line chart for balance trend
  - a pie chart for category-wise spending
- Displays transactions with search, filter, and sort.
- Supports two frontend roles:
  - Viewer: can only view data
  - Admin: can add, edit, and delete transactions
- Shows insight cards (highest spending category, monthly comparison, savings).
- Handles empty states and responsive layouts for mobile, tablet, and desktop.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 3
- Framer Motion
- Recharts
- Lucide React
- Context API for state management

## Data and Storage

- No backend API is used.
- Uses mock/static transaction data.
- Persists app data in local storage.
- Local storage key: finance-dashboard-state-v1

## How To Run

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Assignment Requirements Mapping

1. Dashboard Overview: Completed
- Summary cards for balance, income, expenses
- Time-based line chart
- Category-based pie chart

2. Transactions Section: Completed
- Date, amount, category, type
- Search, filter, sort

3. Basic Role-Based UI: Completed
- Viewer and Admin mode switch
- Admin-only transaction actions

4. Insights Section: Completed
- Highest spending category
- Monthly comparison
- Useful savings insight

5. State Management: Completed
- Context API for transactions, filters, role, theme

6. UI/UX Expectations: Completed
- Clean, readable layout
- Works on different screen sizes
- Handles empty/no-data states

7. Documentation: Completed
- Setup steps, features, approach, and requirement coverage

## Extra Features Added

- Dark and light mode
- CSV export
- Smooth UI animations
- Sticky section navigation
- Loading skeletons
- Role-switch visual feedback
- Scroll progress indicator

## Project Structure

```text
src/
  components/
    DashboardCards.jsx
    Charts.jsx
    TransactionsTable.jsx
    RoleSwitcher.jsx
    Insights.jsx
    TransactionModal.jsx
  context/
    AppContext.jsx
  pages/
    Dashboard.jsx
  utils/
    data.js
  App.jsx
  main.jsx
```

## Responsive Check (Quick)

Recommended viewport checks:

- 360px: small mobile
- 768px: tablet
- 1024px: laptop
- 1440px: desktop

What to verify:

- No horizontal overflow
- Navigation works smoothly
- Charts stay visible and readable
- Transaction actions are accessible in Admin mode

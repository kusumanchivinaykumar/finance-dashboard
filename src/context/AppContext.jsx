import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { initialTransactions } from '../utils/data';

const STORAGE_KEY = 'finance-dashboard-state-v1';
const AppContext = createContext(null);

const initialState = {
  transactions: initialTransactions,
  filters: {
    search: '',
    category: 'all',
    type: 'all',
    sortBy: 'date-desc',
  },
  role: 'viewer',
  theme: 'dark',
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.payload.id ? action.payload : tx,
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((tx) => tx.id !== action.payload),
      };
    default:
      return state;
  }
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored);
    return {
      ...initialState,
      ...parsed,
      filters: { ...initialState.filters, ...(parsed.filters || {}) },
    };
  } catch {
    return initialState;
  }
}

const formatMonth = (dateString) =>
  new Date(dateString).toLocaleString('en-US', { month: 'short' });

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState, loadState);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        transactions: state.transactions,
        filters: state.filters,
        role: state.role,
        theme: state.theme,
      }),
    );
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const derived = useMemo(() => {
    const income = state.transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const expenses = state.transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const balance = income - expenses;

    let filtered = [...state.transactions];

    if (state.filters.search.trim()) {
      const query = state.filters.search.toLowerCase();
      filtered = filtered.filter((tx) =>
        [tx.category, tx.note || '', tx.type, tx.date].join(' ').toLowerCase().includes(query),
      );
    }

    if (state.filters.category !== 'all') {
      filtered = filtered.filter((tx) => tx.category === state.filters.category);
    }

    if (state.filters.type !== 'all') {
      filtered = filtered.filter((tx) => tx.type === state.filters.type);
    }

    if (state.filters.sortBy === 'amount-asc') {
      filtered.sort((a, b) => a.amount - b.amount);
    }
    if (state.filters.sortBy === 'amount-desc') {
      filtered.sort((a, b) => b.amount - a.amount);
    }
    if (state.filters.sortBy === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if (state.filters.sortBy === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const monthlyFlow = state.transactions.reduce((acc, tx) => {
      const month = formatMonth(tx.date);
      const signedAmount = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
      acc[month] = (acc[month] || 0) + signedAmount;
      return acc;
    }, {});

    let runningBalance = 0;
    const trendData = Object.entries(monthlyFlow).map(([month, value]) => {
      runningBalance += value;
      return { month, balance: runningBalance };
    });

    const categorySums = state.transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
        return acc;
      }, {});

    const categoryData = Object.entries(categorySums).map(([name, value]) => ({ name, value }));

    const highestSpendingCategory =
      categoryData.sort((a, b) => b.value - a.value)[0] || { name: 'N/A', value: 0 };

    const monthKey = (dateStr) => dateStr.slice(0, 7);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(
      lastMonthDate.getMonth() + 1,
    ).padStart(2, '0')}`;

    const monthNet = (month) =>
      state.transactions
        .filter((tx) => monthKey(tx.date) === month)
        .reduce((sum, tx) => {
          const signed = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
          return sum + signed;
        }, 0);

    const thisMonthNet = monthNet(currentMonth);
    const lastMonthNet = monthNet(lastMonth);

    return {
      income,
      expenses,
      balance,
      savings: balance,
      filteredTransactions: filtered,
      trendData,
      categoryData,
      highestSpendingCategory,
      monthlyComparison: {
        thisMonthNet,
        lastMonthNet,
      },
    };
  }, [state]);

  const value = {
    ...state,
    ...derived,
    setRole: (role) => dispatch({ type: 'SET_ROLE', payload: role }),
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    setFilters: (filters) => dispatch({ type: 'SET_FILTERS', payload: filters }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
    addTransaction: (transaction) => dispatch({ type: 'ADD_TRANSACTION', payload: transaction }),
    updateTransaction: (transaction) => dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction }),
    deleteTransaction: (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
}

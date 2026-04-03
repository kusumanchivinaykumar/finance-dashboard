import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lightbulb,
  ReceiptText,
  ShieldCheck,
  User,
  WalletCards,
} from 'lucide-react';
import DashboardCards from '../components/DashboardCards';
import Insights from '../components/Insights';
import RoleSwitcher from '../components/RoleSwitcher';
import TransactionModal from '../components/TransactionModal';
import TransactionsTable from '../components/TransactionsTable';
import { useAppContext } from '../context/AppContext';

const Charts = lazy(() => import('../components/Charts'));

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'charts', label: 'Charts', icon: BarChart3 },
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'transactions', label: 'Transactions', icon: ReceiptText },
];

function ChartsFallback() {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <div className="glass h-80 p-5 xl:col-span-2">
        <div className="skeleton-shimmer h-full w-full rounded-xl" />
      </div>
      <div className="glass h-80 p-5">
        <div className="skeleton-shimmer h-full w-full rounded-xl" />
      </div>
    </section>
  );
}

function exportCsv(transactions) {
  const headers = ['Date', 'Category', 'Type', 'Amount', 'Note'];
  const rows = transactions.map((tx) => [tx.date, tx.category, tx.type, tx.amount, tx.note || '']);
  const csv = [headers, ...rows]
    .map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transactions.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const { role, transactions, addTransaction, updateTransaction, deleteTransaction } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [roleAnnouncement, setRoleAnnouncement] = useState('');
  const previousRoleRef = useRef(role);
  const sectionRefs = useRef({});
  const observerRafRef = useRef(null);
  const pendingSectionRef = useRef(null);
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setSectionRef = (id) => (node) => {
    if (node) {
      sectionRefs.current[id] = node;
      return;
    }
    delete sectionRefs.current[id];
  };

  const availableNavItems = useMemo(
    () => (isFocusMode ? navItems.filter((item) => item.id !== 'charts' && item.id !== 'insights') : navItems),
    [isFocusMode],
  );
  const activeIndex = availableNavItems.findIndex((item) => item.id === activeSection);
  const navProgress =
    availableNavItems.length > 1 && activeIndex >= 0
      ? (activeIndex / (availableNavItems.length - 1)) * 100
      : 0;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sections = availableNavItems
      .map((item) => sectionRefs.current[item.id])
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          pendingSectionRef.current = visible.target.id;
          if (observerRafRef.current !== null) return;

          observerRafRef.current = window.requestAnimationFrame(() => {
            observerRafRef.current = null;
            if (pendingSectionRef.current) {
              setActiveSection((prev) => (prev === pendingSectionRef.current ? prev : pendingSectionRef.current));
            }
          });
        }
      },
      {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-20% 0px -55% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      if (observerRafRef.current !== null) {
        window.cancelAnimationFrame(observerRafRef.current);
        observerRafRef.current = null;
      }
    };
  }, [availableNavItems, isLoading]);

  useEffect(() => {
    const handleScrollProgress = () => {
      const top = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.max(0, (top / total) * 100)));
    };

    handleScrollProgress();
    window.addEventListener('scroll', handleScrollProgress, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  const getSectionScrollOffset = () => {
    const mobileNav = document.getElementById('mobile-section-nav');
    const navVisible = mobileNav && window.getComputedStyle(mobileNav).display !== 'none';
    if (navVisible) {
      return mobileNav.getBoundingClientRect().height + 24;
    }
    return 28;
  };

  useEffect(() => {
    const applySectionOffsets = () => {
      const offset = getSectionScrollOffset();
      availableNavItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (section) {
          section.style.scrollMarginTop = `${offset}px`;
        }
      });
    };

    applySectionOffsets();
    window.addEventListener('resize', applySectionOffsets);
    return () => window.removeEventListener('resize', applySectionOffsets);
  }, [availableNavItems, isLoading]);

  const handleNavigate = (id) => {
    setActiveSection(id);
    const section = sectionRefs.current[id];
    if (section) {
      const offset = getSectionScrollOffset();
      const top = section.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  const subtitle = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    return `Track, compare, and optimize your finances. ${today}`;
  }, []);

  useEffect(() => {
    if (!availableNavItems.some((item) => item.id === activeSection)) {
      setActiveSection(availableNavItems[0]?.id || 'overview');
    }
  }, [activeSection, availableNavItems]);

  useEffect(() => {
    if (previousRoleRef.current === role) return;
    const nextLabel = role === 'admin' ? 'Admin' : 'Viewer';
    setRoleAnnouncement(`Switched to ${nextLabel} mode`);
    previousRoleRef.current = role;

    const timer = window.setTimeout(() => setRoleAnnouncement(''), 1800);
    return () => window.clearTimeout(timer);
  }, [role]);

  useEffect(() => {
    const mobileNav = document.getElementById('mobile-section-nav');
    if (!mobileNav) return;
    const activeChip = mobileNav.querySelector(`[data-section-chip="${activeSection}"]`);
    if (!activeChip) return;

    // Horizontal centering avoids browser-specific vertical page jumps from scrollIntoView on mobile.
    const navRect = mobileNav.getBoundingClientRect();
    const chipRect = activeChip.getBoundingClientRect();
    const left = mobileNav.scrollLeft + chipRect.left - navRect.left - (navRect.width - chipRect.width) / 2;
    mobileNav.scrollTo({ left: Math.max(0, left), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, [activeSection]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleSave = (transaction) => {
    if (editing) {
      updateTransaction(transaction);
    } else {
      addTransaction(transaction);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Delete this transaction permanently?');
    if (confirmed) {
      deleteTransaction(id);
    }
  };

  const sectionReveal = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.36, ease: 'easeOut' },
  };

  const skeletonReveal = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.28, ease: 'easeOut' },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="progress-track" aria-hidden>
        <div className="progress-fill" style={{ width: `${scrollProgress}%` }} />
      </div>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        >
          <motion.p
            className="mb-1 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-700/30 dark:text-brand-100"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.3 }}
          >
            <WalletCards size={14} />
            Financial Command Center
          </motion.p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Finance Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        </motion.div>

        <motion.div
          className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.32, ease: 'easeOut' }}
        >
          <RoleSwitcher />
          <button
            type="button"
            onClick={() => setIsFocusMode((prev) => !prev)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {isFocusMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
          </button>
          <button
            type="button"
            onClick={() => exportCsv(transactions)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <Download size={16} />
            Export CSV
          </button>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        {roleAnnouncement ? (
          <motion.div
            key={roleAnnouncement}
            className="glass mb-4 flex items-center gap-2 border border-brand-200/70 bg-brand-50/80 px-3 py-2 text-sm text-brand-800 dark:border-brand-700/50 dark:bg-brand-900/30 dark:text-brand-100"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            role="status"
            aria-live="polite"
          >
            {role === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
            <span className="font-medium">{roleAnnouncement}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <nav
        id="mobile-section-nav"
        className="mobile-section-nav glass sticky top-3 z-30 mb-5 flex gap-2 overflow-x-auto p-2 lg:hidden"
        aria-label="Section navigation"
      >
        {availableNavItems.map(({ id, label, icon: Icon }, index) => (
          <motion.button
            key={id}
            type="button"
            data-section-chip={id}
            onClick={() => handleNavigate(id)}
            className={`nav-chip whitespace-nowrap ${activeSection === id ? 'nav-chip-active' : ''}`}
            aria-current={activeSection === id ? 'page' : undefined}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.02 * index, duration: 0.2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Icon size={14} />
            {label}
          </motion.button>
        ))}
      </nav>

      <div
        className={`grid gap-5 lg:items-start ${
          isFocusMode
            ? 'lg:grid-cols-1'
            : isSidebarCollapsed
              ? 'lg:grid-cols-[84px_1fr]'
              : 'lg:grid-cols-[260px_1fr]'
        }`}
      >
        <aside className={`glass hidden p-4 lg:sticky lg:top-6 lg:block ${isFocusMode ? 'lg:hidden' : ''}`}>
          <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <p
                className={`font-display text-lg font-semibold tracking-tight transition-opacity ${
                  isSidebarCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                Navigation
              </p>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label={isSidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
            <p
              className={`mt-1 text-xs text-slate-500 transition-opacity dark:text-slate-400 ${
                isSidebarCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            >
              Portfolio-grade finance workspace
            </p>
            <div className={`mt-3 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Current Section</span>
                <span>{Math.max(activeIndex + 1, 1)}/{availableNavItems.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 via-cyan-500 to-emerald-500 transition-[width] duration-300"
                  style={{ width: `${navProgress}%` }}
                />
              </div>
            </div>
          </div>
          <nav className="space-y-1 text-sm" aria-label="Section navigation">
            {availableNavItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigate(id)}
                className={`nav-chip w-full ${isSidebarCollapsed ? 'justify-center' : ''} ${
                  activeSection === id ? 'nav-chip-active' : ''
                }`}
                aria-current={activeSection === id ? 'page' : undefined}
                title={label}
              >
                <Icon size={16} />
                <span className={isSidebarCollapsed ? 'hidden' : 'inline'}>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-5">
          {isLoading ? (
            <>
              <motion.section
                className="grid gap-4 md:grid-cols-3"
                id="overview"
                ref={setSectionRef('overview')}
                {...skeletonReveal}
              >
                {[0, 1, 2].map((item, index) => (
                  <motion.div
                    key={`overview-skeleton-${item}`}
                    className="glass h-36 p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * index, duration: 0.24 }}
                  >
                    <div className="skeleton-shimmer h-full w-full rounded-xl" />
                  </motion.div>
                ))}
              </motion.section>
              <motion.section
                className="grid gap-4 xl:grid-cols-3"
                id="charts"
                ref={setSectionRef('charts')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.28, ease: 'easeOut' }}
              >
                <motion.div
                  className="glass h-80 p-5 xl:col-span-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.24 }}
                >
                  <div className="skeleton-shimmer h-full w-full rounded-xl" />
                </motion.div>
                <motion.div
                  className="glass h-80 p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.24 }}
                >
                  <div className="skeleton-shimmer h-full w-full rounded-xl" />
                </motion.div>
              </motion.section>
              <motion.section
                className="grid gap-4 md:grid-cols-3"
                id="insights"
                ref={setSectionRef('insights')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.28, ease: 'easeOut' }}
              >
                {[0, 1, 2].map((item, index) => (
                  <motion.div
                    key={`insight-skeleton-${item}`}
                    className="glass h-36 p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + 0.04 * index, duration: 0.24 }}
                  >
                    <div className="skeleton-shimmer h-full w-full rounded-xl" />
                  </motion.div>
                ))}
              </motion.section>
              <motion.section
                className="glass h-72 p-5"
                id="transactions"
                ref={setSectionRef('transactions')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.28, ease: 'easeOut' }}
              >
                <div className="skeleton-shimmer h-full w-full rounded-xl" />
              </motion.section>
            </>
          ) : (
            <>
              <motion.section id="overview" ref={setSectionRef('overview')} {...sectionReveal}>
                <DashboardCards />
              </motion.section>
              {isFocusMode ? null : (
                <motion.section
                  id="charts"
                  ref={setSectionRef('charts')}
                  {...sectionReveal}
                  transition={{ ...sectionReveal.transition, delay: 0.06 }}
                >
                  <Suspense fallback={<ChartsFallback />}>
                    <Charts />
                  </Suspense>
                </motion.section>
              )}
              {isFocusMode ? null : (
                <motion.section
                  id="insights"
                  ref={setSectionRef('insights')}
                  {...sectionReveal}
                  transition={{ ...sectionReveal.transition, delay: 0.1 }}
                >
                  <Insights />
                </motion.section>
              )}
              <motion.section
                id="transactions"
                ref={setSectionRef('transactions')}
                {...sectionReveal}
                transition={{ ...sectionReveal.transition, delay: 0.14 }}
              >
                <TransactionsTable
                  onAddClick={() => setIsModalOpen(true)}
                  onEditClick={(tx) => {
                    setEditing(tx);
                    setIsModalOpen(true);
                  }}
                  onDeleteClick={handleDelete}
                />
                <div className="mt-3 flex justify-end">
                  <motion.button
                    type="button"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
                    }
                    className="nav-chip"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back to top
                  </motion.button>
                </div>
              </motion.section>
            </>
          )}
        </div>
      </div>

      {role === 'admin' ? (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSave}
          editingTransaction={editing}
        />
      ) : null}
    </div>
  );
}

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  );

const cards = [
  {
    key: 'balance',
    title: 'Total Balance',
    field: 'balance',
    icon: Wallet,
    accent: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'income',
    title: 'Total Income',
    field: 'income',
    icon: ArrowUpCircle,
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    key: 'expenses',
    title: 'Total Expenses',
    field: 'expenses',
    icon: ArrowDownCircle,
    accent: 'from-rose-500 to-red-600',
  },
];

function AnimatedCurrency({ value }) {
  const base = useMotionValue(0);
  const smooth = useSpring(base, { stiffness: 90, damping: 20, mass: 0.8 });
  const formatted = useTransform(smooth, (latest) => formatCurrency(Math.max(0, Math.round(latest))));

  useEffect(() => {
    base.set(value);
  }, [base, value]);

  return <motion.span>{formatted}</motion.span>;
}

export default function DashboardCards() {
  const metrics = useAppContext();

  return (
    <section>
      <h2 className="section-title">Dashboard Overview</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ key, title, field, icon: Icon, accent }, idx) => (
          <motion.article
            key={key}
            className="glass relative overflow-hidden p-5"
            whileHover={{ y: -6, scale: 1.015 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.36, ease: 'easeOut' }}
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
            <motion.div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl dark:bg-white/10"
              animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.75, 0.45] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
            />
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                <p className="mt-2 font-display text-2xl font-semibold">
                  <AnimatedCurrency value={metrics[field]} />
                </p>
              </div>
              <div
                className={`rounded-xl bg-gradient-to-br p-2.5 text-white shadow-lg ${accent}`}
                aria-hidden
              >
                <Icon size={20} />
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

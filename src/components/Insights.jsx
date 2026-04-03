import { motion } from 'framer-motion';
import { PiggyBank, Sparkle, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  );

export default function Insights() {
  const { highestSpendingCategory, monthlyComparison, savings } = useAppContext();

  const growth = monthlyComparison.lastMonthNet
    ? ((monthlyComparison.thisMonthNet - monthlyComparison.lastMonthNet) /
        Math.abs(monthlyComparison.lastMonthNet)) *
      100
    : 0;

  return (
    <section>
      <h2 className="section-title">Insights</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <motion.article
          className="glass p-5"
          whileHover={{ y: -4, scale: 1.01 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
        >
          <div className="mb-3 flex items-center gap-2 text-amber-500">
            <motion.span
              animate={{ rotate: [0, 10, 0], scale: [1, 1.08, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkle size={18} />
            </motion.span>
            <p className="font-medium">Highest Spending Category</p>
          </div>
          <p className="font-display text-xl">{highestSpendingCategory.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {money(highestSpendingCategory.value)} spent
          </p>
        </motion.article>

        <motion.article
          className="glass p-5"
          whileHover={{ y: -4, scale: 1.01 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.32, ease: 'easeOut', delay: 0.08 }}
        >
          <div className="mb-3 flex items-center gap-2 text-blue-500">
            <motion.span
              animate={{ y: [0, -2, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp size={18} />
            </motion.span>
            <p className="font-medium">Monthly Comparison</p>
          </div>
          <p className="font-display text-xl">{growth.toFixed(1)}%</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="block">This month: {money(monthlyComparison.thisMonthNet)}</span>
            <span className="block">Last month: {money(monthlyComparison.lastMonthNet)}</span>
          </p>
        </motion.article>

        <motion.article
          className="glass p-5"
          whileHover={{ y: -4, scale: 1.01 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.32, ease: 'easeOut', delay: 0.16 }}
        >
          <div className="mb-3 flex items-center gap-2 text-emerald-500">
            <motion.span
              animate={{ rotate: [0, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <PiggyBank size={18} />
            </motion.span>
            <p className="font-medium">Total Savings</p>
          </div>
          <p className="font-display text-xl">{money(savings)}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Income minus all expenses</p>
        </motion.article>
      </div>
    </section>
  );
}

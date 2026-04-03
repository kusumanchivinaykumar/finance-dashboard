import { ArrowDownWideNarrow, ArrowUpWideNarrow, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { categories } from '../utils/data';
import { useAppContext } from '../context/AppContext';

const money = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  );

const dateLabel = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlight(text, query) {
  if (!query.trim()) return text;
  const source = String(text);
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'ig');
  const parts = source.split(regex);
  const queryLower = query.toLowerCase();
  return parts.map((part, index) =>
    part.toLowerCase() === queryLower ? (
      <mark key={`${part}-${index}`} className="highlight-mark rounded px-1">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    ),
  );
}

export default function TransactionsTable({ onAddClick, onEditClick, onDeleteClick }) {
  const { role, filters, setFilters, resetFilters, filteredTransactions } = useAppContext();
  const reduceMotion = useReducedMotion();

  return (
    <section className="glass p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="section-title mb-0">Transactions</h2>
        <AnimatePresence>
          {role === 'admin' ? (
            <motion.button
              key="add-transaction"
              type="button"
              onClick={onAddClick}
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700 sm:ml-auto sm:w-auto"
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Plus size={16} />
              Add Transaction
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <motion.div
        className="mb-4 grid gap-3 lg:grid-cols-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <label className="relative lg:col-span-2">
          <Search size={16} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
          <input
            type="search"
            placeholder="Search by note, category, type..."
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </label>

        <select
          value={filters.category}
          onChange={(event) => setFilters({ category: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(event) => setFilters({ type: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(event) => setFilters({ sortBy: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="date-desc">Sort: Date (Newest)</option>
          <option value="date-asc">Sort: Date (Oldest)</option>
          <option value="amount-desc">Sort: Amount (High-Low)</option>
          <option value="amount-asc">Sort: Amount (Low-High)</option>
        </select>
      </motion.div>

      <motion.div
        className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.06, duration: 0.24 }}
      >
        <p>{filteredTransactions.length} transaction(s) shown</p>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Reset Filters
        </button>
      </motion.div>

      {filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center dark:border-slate-700">
          <motion.div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/70"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -5, 0],
                    boxShadow: ['0 0 0 rgba(15, 23, 42, 0)', '0 12px 30px rgba(15, 23, 42, 0.14)', '0 0 0 rgba(15, 23, 42, 0)'],
                  }
            }
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          >
            <Search size={20} className="text-slate-500 dark:text-slate-300" />
          </motion.div>
          <p className="font-medium">No transactions found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Adjust filters or add a new transaction to get started.
          </p>
          <AnimatePresence>
            {role === 'admin' ? (
              <motion.button
                key="create-first-transaction"
                type="button"
                onClick={onAddClick}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Plus size={16} />
                Create First Transaction
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      ) : (
        <>
          <motion.div
            className="space-y-3 md:hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <AnimatePresence initial={false}>
              {filteredTransactions.map((tx, index) => (
                <motion.article
                  key={tx.id}
                  className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, delay: Math.min(index * 0.015, 0.18) }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {renderHighlight(dateLabel(tx.date), filters.search)}
                      </p>
                      <p className="font-medium">{renderHighlight(tx.category, filters.search)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${{
                        income: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
                        expense: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
                      }[tx.type]}`}
                    >
                      {renderHighlight(tx.type, filters.search)}
                    </span>
                  </div>
                  <p className="mb-2 break-words text-sm text-slate-600 dark:text-slate-300">
                    {renderHighlight(tx.note || '-', filters.search)}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm font-medium ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {money(tx.amount)}
                    </p>
                    <AnimatePresence>
                      {role === 'admin' ? (
                        <motion.div
                          key={`mobile-actions-${tx.id}`}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.18 }}
                        >
                          <button
                            type="button"
                            onClick={() => onEditClick(tx)}
                            className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                            aria-label="Edit transaction"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClick(tx.id)}
                            className="rounded-md border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20"
                            aria-label="Delete transaction"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="hidden overflow-x-auto md:block"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <table className="min-w-[760px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-2 py-3">Date</th>
                <th className="px-2 py-3">Category</th>
                <th className="px-2 py-3">Note</th>
                <th className="px-2 py-3">Type</th>
                <th className="px-2 py-3">Amount</th>
                <th className="px-2 py-3">Sort</th>
                <th className="px-2 py-3 text-right">
                  <AnimatePresence mode="wait" initial={false}>
                    {role === 'admin' ? (
                      <motion.span
                        key="actions-header"
                        className="inline-block"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.16 }}
                      >
                        Actions
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </th>
              </tr>
            </thead>
            <motion.tbody layout>
              <AnimatePresence initial={false}>
                {filteredTransactions.map((tx, index) => (
                <motion.tr
                  key={tx.id}
                  className="border-b border-slate-100 dark:border-slate-800"
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  whileHover={{ backgroundColor: 'rgba(148, 163, 184, 0.08)' }}
                  transition={{ duration: 0.22, delay: Math.min(index * 0.015, 0.18) }}
                >
                  <td className="px-2 py-3">{renderHighlight(dateLabel(tx.date), filters.search)}</td>
                  <td className="px-2 py-3">{renderHighlight(tx.category, filters.search)}</td>
                  <td className="max-w-56 truncate px-2 py-3">{renderHighlight(tx.note || '-', filters.search)}</td>
                  <td className="px-2 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        tx.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                      }`}
                    >
                      {renderHighlight(tx.type, filters.search)}
                    </span>
                  </td>
                  <td
                    className={`px-2 py-3 font-medium ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {money(tx.amount)}
                  </td>
                  <td className="px-2 py-3">
                    {filters.sortBy.includes('amount') ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        {filters.sortBy === 'amount-desc' ? (
                          <ArrowDownWideNarrow size={14} />
                        ) : (
                          <ArrowUpWideNarrow size={14} />
                        )}
                        Amount
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Date</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <AnimatePresence>
                      {role === 'admin' ? (
                        <motion.div
                          key={`desktop-actions-${tx.id}`}
                          className="flex justify-end gap-2"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.16 }}
                        >
                          <button
                            type="button"
                            onClick={() => onEditClick(tx)}
                            className="rounded-md border border-slate-300 p-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClick(tx.id)}
                            className="rounded-md border border-rose-200 p-1.5 text-rose-500 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
          </motion.div>
        </>
      )}
    </section>
  );
}

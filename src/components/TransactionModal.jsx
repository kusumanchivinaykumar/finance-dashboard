import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { categories } from '../utils/data';

const defaultData = {
  date: '',
  amount: '',
  category: 'Salary',
  type: 'income',
  note: '',
};

export default function TransactionModal({ isOpen, onClose, onSave, editingTransaction }) {
  const [formData, setFormData] = useState(defaultData);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingTransaction) {
      setFormData({ ...editingTransaction, amount: String(editingTransaction.amount) });
    } else {
      setFormData({ ...defaultData, date: new Date().toISOString().slice(0, 10) });
    }
    setError('');
  }, [editingTransaction, isOpen]);

  const title = useMemo(() => (editingTransaction ? 'Edit Transaction' : 'Add Transaction'), [editingTransaction]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.date || !formData.amount || Number(formData.amount) <= 0 || !formData.category) {
      setError('Please provide a valid date, category, and amount greater than 0.');
      return;
    }

    onSave({
      ...formData,
      amount: Number(formData.amount),
      id: editingTransaction?.id || `tx-${Date.now()}`,
    });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="glass w-full max-w-lg p-5"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Date
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>

                <label className="text-sm">
                  Amount
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, amount: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Category
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, category: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  Type
                  <select
                    value={formData.type}
                    onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm">
                Note
                <input
                  type="text"
                  placeholder="Optional note"
                  value={formData.note}
                  onChange={(event) => setFormData((prev) => ({ ...prev, note: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </label>

              {error ? <p className="text-sm text-rose-500">{error}</p> : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

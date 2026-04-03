import { AnimatePresence, motion } from 'framer-motion';
import { MoonStar, ShieldCheck, SunMedium, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function RoleSwitcher() {
  const { role, setRole, theme, setTheme } = useAppContext();

  return (
    <div className="glass flex w-full flex-col gap-2 p-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={role}
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.92 }}
            transition={{ duration: 0.18 }}
            className="inline-flex"
          >
            {role === 'admin' ? <ShieldCheck size={16} /> : <User size={16} />}
          </motion.span>
        </AnimatePresence>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm sm:w-auto dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="viewer">Viewer</option>
          <option value="admin">Admin</option>
        </select>
        <motion.span
          key={role}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className={`hidden rounded-md px-2 py-1 text-xs font-semibold sm:inline-block ${
            role === 'admin'
              ? 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200'
          }`}
        >
          {role === 'admin' ? 'Admin Mode' : 'Viewer Mode'}
        </motion.span>
      </div>

      <motion.button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 sm:ml-auto sm:w-auto dark:border-slate-700 dark:hover:bg-slate-800"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.span
          animate={{ rotate: theme === 'dark' ? 0 : 180 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
        </motion.span>
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </motion.button>
    </div>
  );
}

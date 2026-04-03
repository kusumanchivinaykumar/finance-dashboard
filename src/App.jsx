import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';

function AppShell() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/20"
          animate={{ x: [0, 20, 0], y: [0, -12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-700/20"
          animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-700/20"
          animate={{ x: [0, 14, 0], y: [0, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.main
          key="dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <Dashboard />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

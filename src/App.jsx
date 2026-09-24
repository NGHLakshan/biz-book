import { useState, useEffect } from "react";
import { PlusCircle, LayoutDashboard, Settings2, Lock, BarChart2, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import TransactionForm from "./components/TransactionForm";
import Dashboard from "./components/Dashboard";
import OfflineBanner from "./components/OfflineBanner";
import Settings from "./components/Settings";
import PinLock from "./components/PinLock";
import SummaryView from "./components/SummaryView";
import Logo from "./components/Logo";
import Login from "./components/Login";
import { subscribeToTransactions } from "./services/transactions";

const TABS = [
  { id: "dashboard", label: "Dashboard",  Icon: LayoutDashboard },
  { id: "form",      label: "Add Entry",  Icon: PlusCircle },
  { id: "summary",   label: "Summary",    Icon: BarChart2 },
  { id: "settings",  label: "Settings",   Icon: Settings2 },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [isLocked, setIsLocked] = useState(() => !!localStorage.getItem("app_pin"));
  const [transactions, setTransactions] = useState([]);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });

    return unsubscribeAuth;
  }, []);

  // Only subscribe to data when user is authenticated
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTransactions((data) => setTransactions(data));
    return unsub;
  }, [user]);

  if (authChecking) {
    return (
      <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col items-center justify-center">
        <Logo size="lg" className="animate-pulse mb-6 opacity-50" />
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show Login screen if not authenticated
  if (!user) {
    return (
      <>
        <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '16px', border: '1px solid #334155' } }} />
        <Login />
      </>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-slate-950 flex flex-col overflow-hidden relative">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Toaster for premium notifications */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid #334155',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel px-4 py-3 border-b border-slate-800/50">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Logo size="md" />
          <div className="flex-1">
            <h1 className="font-bold text-base leading-none tracking-tight gradient-text from-emerald-400 to-sky-400 pb-1">
              Anura Biz Book
            </h1>
            <p className="text-slate-400 text-xs font-medium">Income &amp; Expense Tracker</p>
          </div>
          {/* Online indicator */}
          <div id="connection-indicator" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse glow-emerald" />
            <span className="text-xs text-slate-400 hidden sm:inline font-medium">Online</span>
          </div>

          {/* Quick Lock Button if PIN is set */}
          {localStorage.getItem("app_pin") && (
            <button
              onClick={() => setIsLocked(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700/70 border border-slate-700/50 text-slate-400 hover:text-emerald-400 transition-all"
              title="Lock App"
            >
              <Lock size={14} />
            </button>
          )}
        </div>
      </header>

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Main Content with Page Transitions */}
      {/* Each motion.div gets key={tab} → fresh DOM element → scrollTop always 0 */}
      <main className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full w-full"
          >
            <div className="h-full w-full overflow-y-auto pb-24" id="main-scroller">
              {tab === "form" ? (
                <TransactionForm />
              ) : tab === "settings" ? (
                <Settings transactions={transactions} />
              ) : tab === "summary" ? (
                <SummaryView transactions={transactions} />
              ) : (
                <Dashboard onNewEntry={() => setTab("form")} />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/50 pb-safe">
        <div className="max-w-lg mx-auto flex p-1">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => setTab(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl transition-all relative outline-none ${
                  active ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {/* Active Background Glow */}
                {active && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-emerald-500/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 flex flex-col items-center gap-1"
                >
                  <Icon
                    size={24}
                    strokeWidth={active ? 2.5 : 1.5}
                    className={active ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : ""}
                  />
                  <span className="text-[11px] font-medium tracking-wide">{label}</span>
                </motion.div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* PIN Lock Screen on startup or when locked */}
      <AnimatePresence>
        {isLocked && (
          <PinLock
            key="app-lock"
            mode="verify"
            onSuccess={() => setIsLocked(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

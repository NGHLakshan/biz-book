import { useState, useEffect } from "react";
import { subscribeToCategories, addCategory } from "../services/categories";
import { PlusCircle, Settings2, ChevronRight, TrendingUp, TrendingDown, KeyRound, Shield, Download, FileText } from "lucide-react";
import { exportToCSV } from "../utils/export";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import CategoryManagerModal from "./CategoryManagerModal";
import PinLock from "./PinLock";

export default function Settings({ transactions }) {
  const [categories, setCategories] = useState([]);
  const [exportMonth, setExportMonth] = useState("all");
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [managingCategory, setManagingCategory] = useState(null);
  
  // PIN Lock states
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinMode, setPinMode] = useState("setup"); // 'setup' or 'remove'

  useEffect(() => {
    const unsub = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });
    
    // Check initial PIN state
    const savedPin = localStorage.getItem("app_pin");
    setIsPinEnabled(!!savedPin);

    return unsub;
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setIsAdding(true);
      await addCategory(newCategoryName.trim());
      setNewCategoryName("");
      toast.success("Category added!");
    } catch (error) {
      toast.error("Failed to add category.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings2 size={22} className="text-emerald-400" />
          Settings
        </h2>
        <p className="text-slate-400 text-sm mt-1">Manage categories, income &amp; expense types.</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Categories</h3>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="mb-5">
          <div className="flex gap-2 items-center bg-slate-900/60 border border-slate-700/60 rounded-2xl px-3 py-2 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <PlusCircle size={16} className="text-emerald-400 shrink-0 ml-1" />
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name…"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none py-1.5"
              disabled={isAdding}
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={isAdding || !newCategoryName.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
            >
              {isAdding ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : null}
              {isAdding ? "Adding…" : "Add"}
            </motion.button>
          </div>
        </form>

        {/* Categories List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent glow-emerald" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-4">No categories found. Add one above.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => setManagingCategory(cat)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 transition-all text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-semibold block group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400/70">
                        <TrendingUp size={10} />
                        {(cat.incomeTypes || []).length} income types
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-red-400/70">
                        <TrendingDown size={10} />
                        {(cat.expenseTypes || []).length} expense types
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Security Settings */}
      <div className="glass-card p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Security</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div>
              <span className="text-white text-sm font-semibold block">App PIN Lock</span>
              <span className="text-slate-400 text-xs block mt-0.5">Require 4-digit PIN on startup</span>
            </div>
            
            <button
              onClick={() => {
                if (isPinEnabled) {
                  setPinMode("remove");
                  setShowPinSetup(true);
                } else {
                  setPinMode("setup");
                  setShowPinSetup(true);
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isPinEnabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/25" : "bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isPinEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Change PIN button when enabled */}
          {isPinEnabled && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div>
                <span className="text-white text-sm font-semibold block">Change PIN</span>
                <span className="text-slate-400 text-xs block mt-0.5">Update your 4-digit security PIN</span>
              </div>
              <button
                onClick={() => {
                  setPinMode("change");
                  setShowPinSetup(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
              >
                <KeyRound size={13} className="text-emerald-400" />
                Change
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Data Management Settings */}
      <div className="glass-card p-5 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Data Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <div>
              <span className="text-white text-sm font-semibold block">Export to CSV</span>
              <span className="text-slate-400 text-xs block mt-0.5">Download your transactions to open in Excel</span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs px-2 py-1.5 rounded-lg border border-slate-700 outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Time</option>
                {/* Dynamically get unique months from transactions */}
                {transactions && [...new Set(transactions.map(t => {
                  const d = new Date(t.date);
                  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                }))].sort().reverse().map(ym => (
                  <option key={ym} value={ym}>
                    {new Date(`${ym}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </option>
                ))}
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const success = exportToCSV(transactions, exportMonth);
                  if (success) {
                    toast.success("Export successful!");
                  } else {
                    toast.error("No data found to export.");
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0"
              >
                <Download size={14} />
                Export
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Manager Modal */}
      <AnimatePresence>
        {managingCategory && (
          <CategoryManagerModal
            key={managingCategory.id}
            category={managingCategory}
            onClose={() => setManagingCategory(null)}
          />
        )}
      </AnimatePresence>

      {/* Pin Setup/Remove/Change Modal */}
      <AnimatePresence>
        {showPinSetup && (
          <PinLock 
            mode={pinMode}
            onSuccess={() => {
              setIsPinEnabled(!!localStorage.getItem("app_pin"));
              setShowPinSetup(false);
            }}
            onClose={() => setShowPinSetup(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

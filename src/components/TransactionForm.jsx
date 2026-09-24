import { useState, useEffect } from "react";
import { addTransaction } from "../services/transactions";
import { subscribeToCategories } from "../services/categories";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const PAYMENT_METHODS = ["Cash", "Bank"];

const getDefaultForm = (defaultCategory = "") => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const localDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return {
    date: localDate,
    time: pad(now.getHours()) + ':' + pad(now.getMinutes()),
    type: "Income",
    category: defaultCategory,
    subCategory: "",
    amount: "",
    paymentMethod: "Cash",
    description: "",
  };
};

export default function TransactionForm() {
  const [form, setForm] = useState(() => getDefaultForm(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCategories((data) => {
      setCategories(data);
      setLoadingCategories(false);
      setForm((prev) => {
        if (!prev.category && data.length > 0) {
          return { ...prev, category: data[0].name };
        }
        return prev;
      });
    });
    return unsub;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subCategory: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!form.subCategory.trim()) {
      toast.error("Sub Category is required.");
      return;
    }

    setIsSubmitting(true);
    
    // Save in background to make UI feel instant
    addTransaction(form).catch(err => {
      console.error("Failed to save transaction:", err);
      toast.error('Failed to sync. Check console.');
    });

    // Optimistic success update
    setForm({ ...getDefaultForm(categories.length > 0 ? categories[0].name : ""), date: form.date, time: form.time });
    toast.success('Transaction saved successfully!');
    setIsSubmitting(false);
  };

  // Derive dynamic suggestions from the live Firestore category doc
  const activeCatDoc = categories.find(c => c.name === form.category);
  const suggestions = activeCatDoc
    ? (form.type === "Income"
        ? (activeCatDoc.incomeTypes || [])
        : (activeCatDoc.expenseTypes || []))
    : [];

  const noSuggestions = suggestions.length === 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PlusCircle size={22} className="text-emerald-400" />
          New Transaction
        </h2>
        <p className="text-slate-400 text-sm mt-1">Enter details for a new income or expense.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" id="transaction-form">
        <div className="glass-card p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="form-group">
              <label htmlFor="date" className="form-label">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Time */}
            <div className="form-group">
              <label htmlFor="time" className="form-label">Time</label>
              <input
                id="time"
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Type — Premium Radio toggle */}
          <div className="form-group">
            <label className="form-label">Transaction Type</label>
            <div className="flex gap-3 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
              {["Income", "Expense"].map((t) => {
                const isSelected = form.type === t;
                return (
                  <label
                    key={t}
                    id={`type-${t.toLowerCase()}`}
                    className={`flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all font-semibold text-sm select-none z-10 ${
                      isSelected ? "text-white" : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={isSelected}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {isSelected && (
                      <motion.div 
                        layoutId="type-pill"
                        className={`absolute inset-0 rounded-xl -z-10 ${
                          t === "Income" 
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500 glow-emerald" 
                            : "bg-gradient-to-r from-red-600 to-red-500 glow-red"
                        }`}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span>{t === "Income" ? "↑" : "↓"}</span>
                    {t}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-input"
                disabled={loadingCategories || categories.length === 0}
              >
                {loadingCategories ? (
                  <option>Loading...</option>
                ) : categories.length === 0 ? (
                  <option>No Categories Found</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label htmlFor="paymentMethod" className="form-label">Method</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className="form-input"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m === "Cash" ? "💵 Cash" : "🏦 Bank"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub Category */}
          <div className="form-group">
            <label htmlFor="subCategory" className="form-label">Sub Category</label>
            <input
              id="subCategory"
              list="subcat-suggestions"
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              placeholder={noSuggestions ? "Type a custom sub-category…" : "Select or type…"}
              className="form-input"
              autoComplete="off"
            />
            <datalist id="subcat-suggestions">
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {noSuggestions && !loadingCategories && form.category && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <span className="text-amber-400">⚡</span>
                No types configured yet — you can type freely or{" "}
                <span className="text-emerald-400 font-medium">add types in Settings</span>.
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label htmlFor="amount" className="form-label">Amount (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rs.</span>
              <input
                id="amount"
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="form-input pl-11 text-lg font-bold font-mono tracking-tight"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description <span className="text-slate-500 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Additional notes…"
              className="form-input resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          id="btn-save-transaction"
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all glow-emerald shadow-xl border border-white/10 text-base"
        >
          {isSubmitting ? (
            <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <PlusCircle size={20} />
          )}
          {isSubmitting ? "Saving Entry..." : "Save Transaction"}
        </motion.button>
      </form>
    </div>
  );
}

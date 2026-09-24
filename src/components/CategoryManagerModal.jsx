import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Trash2, PlusCircle, Check, Settings2, TrendingUp, TrendingDown } from "lucide-react";
import { addCategoryWithTypes, updateCategoryTypes, updateCategory, deleteCategory } from "../services/categories";
import toast from "react-hot-toast";

/**
 * A reusable list editor for a string array (incomeTypes or expenseTypes).
 */
function TypeListEditor({ label, color, items, onChange }) {
  const [newItem, setNewItem] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingVal, setEditingVal] = useState("");

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
    setNewItem("");
  };

  const handleRename = (idx) => {
    const trimmed = editingVal.trim();
    if (!trimmed) { setEditingIdx(null); return; }
    const updated = [...items];
    updated[idx] = trimmed;
    onChange(updated);
    setEditingIdx(null);
    setEditingVal("");
  };

  const handleDelete = (idx) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        {label === "Income Types" 
          ? <TrendingUp size={14} className="text-emerald-400" /> 
          : <TrendingDown size={14} className="text-red-400" />
        }
        <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label}</span>
      </div>

      {/* Add new item */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          placeholder={`Add ${label === "Income Types" ? "income" : "expense"} type…`}
          className="flex-1 form-input text-sm py-2"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleAdd}
          disabled={!newItem.trim()}
          className={`px-3 rounded-xl border flex items-center justify-center disabled:opacity-40 transition-colors ${
            label === "Income Types"
              ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30"
              : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
          }`}
        >
          <PlusCircle size={16} />
        </motion.button>
      </div>

      {/* Items list */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={`${item}-${idx}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800"
            >
              {editingIdx === idx ? (
                <>
                  <input
                    type="text"
                    value={editingVal}
                    onChange={(e) => setEditingVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(idx)}
                    className="flex-1 bg-transparent text-white text-sm outline-none"
                    autoFocus
                  />
                  <button onClick={() => handleRename(idx)} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded-lg">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingIdx(null)} className="p-1 text-slate-400 hover:bg-slate-700 rounded-lg">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-white">{item}</span>
                  <button
                    onClick={() => { setEditingIdx(idx); setEditingVal(item); }}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <p className="text-slate-600 text-xs text-center py-2">No types added yet.</p>
        )}
      </div>
    </div>
  );
}

/**
 * Full-screen modal for managing a single category's name, incomeTypes, expenseTypes.
 * Props:
 *   category: { id, name, incomeTypes, expenseTypes } (id is null for new categories)
 *   onClose: () => void
 */
export default function CategoryManagerModal({ category, onClose }) {
  const [name, setName] = useState(category?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameVal, setEditingNameVal] = useState("");
  const [incomeTypes, setIncomeTypes] = useState([...(category.incomeTypes || [])]);
  const [expenseTypes, setExpenseTypes] = useState([...(category.expenseTypes || [])]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRenameCategory = async () => {
    const trimmed = editingNameVal.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setName(trimmed);
    setIsEditingName(false);
    if (category.id && trimmed !== category.name) {
      try {
        await updateCategory(category.id, trimmed);
        toast.success("Category renamed!");
      } catch (err) {
        toast.error("Failed to rename category.");
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Category name cannot be empty."); return; }
    setIsSaving(true);
    
    // Save in background to make UI instant
    if (category.id) {
      updateCategoryTypes(category.id, {
        name: name.trim(),
        incomeTypes,
        expenseTypes,
      }).catch(err => toast.error("Failed to sync category update."));
      toast.success("Category saved!");
    } else {
      addCategoryWithTypes({
        name: name.trim(),
        incomeTypes,
        expenseTypes,
      }).catch(err => toast.error("Failed to sync new category."));
      toast.success("Category created!");
    }
    
    setIsSaving(false);
    onClose();
  };

  const handleDelete = () => {
    if (!category.id) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCategory(category.id);
      toast.success("Category deleted.");
      onClose();
    } catch {
      toast.error("Failed to delete category.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 pt-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings2 size={20} className="text-emerald-400" />
            Manage Category
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-6 pb-36 max-w-lg mx-auto w-full">

        {/* Category Name */}
        <div className="glass-card p-5 mb-5 border border-slate-800">
          <label className="form-label mb-2 block font-semibold text-slate-200">Category Name</label>
          {category?.id ? (
            isEditingName ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800">
                <input
                  type="text"
                  value={editingNameVal}
                  onChange={(e) => setEditingNameVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameCategory();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleRenameCategory}
                  className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                  title="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="p-1 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800">
                <span className="flex-1 text-sm text-white">{name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(true);
                    setEditingNameVal(name);
                  }}
                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                  title="Rename Category"
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete Category"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSave())}
              className="form-input w-full text-base font-medium"
              placeholder="e.g. Bus, JCB 1…"
              autoFocus
            />
          )}
        </div>

        {/* Income Types */}
        <div className="glass-card p-5 mb-5 border border-slate-800">
          <TypeListEditor
            label="Income Types"
            color="text-emerald-400"
            items={incomeTypes}
            onChange={setIncomeTypes}
          />
        </div>

        {/* Expense Types */}
        <div className="glass-card p-5 mb-5 border border-slate-800">
          <TypeListEditor
            label="Expense Types"
            color="text-red-400"
            items={expenseTypes}
            onChange={setExpenseTypes}
          />
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 pb-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-xl border border-white/10 text-base"
          >
            {isSaving ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <Check size={18} />
            )}
            {isSaving ? "Saving…" : "Save Changes"}
          </motion.button>

          {category.id && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-3.5 rounded-2xl transition-all text-sm"
            >
              <Trash2 size={16} />
              Delete Category
            </motion.button>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Popup */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -12 }}
              transition={{ type: "spring", damping: 22, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-slate-900 border border-red-500/25 rounded-3xl p-7 shadow-2xl shadow-black/60"
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
                  <Trash2 size={28} className="text-red-400" />
                </div>
              </div>

              {/* Text */}
              <h3 className="text-white font-bold text-xl text-center mb-2">Delete Category?</h3>
              <p className="text-slate-400 text-sm text-center leading-relaxed mb-7">
                <span className="text-white font-semibold">&ldquo;{name.trim() || category.name}&rdquo;</span>{" "}
                category eka delete karanawada?{" "}
                <span className="text-slate-500 block mt-1 text-xs">Existing transactions vatinne na.</span>
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="w-full py-4 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                >
                  {isDeleting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  {isDeleting ? "Deleting…" : "Yes, Delete"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}

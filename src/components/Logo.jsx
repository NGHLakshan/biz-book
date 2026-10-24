import { motion } from "framer-motion";

export default function Logo({ size = "md", className = "", onClick }) {
  const containerClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
  };


  return (
    <motion.div
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`${containerClasses[size]} shrink-0 relative overflow-hidden shadow-lg shadow-emerald-500/25 border border-slate-700/80 bg-slate-900 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      title={onClick ? "Click to refresh" : "Anura Biz Book"}
    >
      <img
        src="/pwa-192x192.png"
        alt="Anura Biz Book Logo"
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 select-none pointer-events-none"
      />
    </motion.div>
  );
}

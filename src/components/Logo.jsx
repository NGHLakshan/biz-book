import { motion } from "framer-motion";

export default function Logo({ size = "md", className = "" }) {
  const containerClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
  };

  const svgSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotate: 2 }}
      className={`${containerClasses[size]} bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0 border border-slate-700/80 relative overflow-hidden group ${className}`}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Pro A SVG */}
      <svg
        className={`${svgSizes[size]} relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L2 22H7.5L12 13L16.5 22H22L12 2Z"
          fill="url(#logo-grad-main)"
        />
        <path
          d="M12 7L7.5 16H16.5L12 7Z"
          fill="url(#logo-grad-inner)"
        />
        <defs>
          <linearGradient id="logo-grad-main" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="logo-grad-inner" x1="7.5" y1="7" x2="16.5" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f172a" />
            <stop offset="1" stopColor="#1e293b" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

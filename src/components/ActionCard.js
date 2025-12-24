// src/components/ActionCard.js
'use client';

import { motion } from 'framer-motion';

export default function ActionCard({ icon, label, description, onClick, delay = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="action-card text-left w-full group relative"
    >
      <div className="flex items-center gap-4">
        <div className="action-icon w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center transition-all">
          <div className="text-primary text-xl">{icon}</div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {label}
          </h3>
          {description && <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{description}</p>}
        </div>
      </div>
    </motion.button>
  );
}
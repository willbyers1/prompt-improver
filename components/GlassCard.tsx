
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  stats?: { characters: number; words: number };
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", title, stats }) => {
  return (
    <div className={`glass rounded-2xl p-6 neon-glow flex flex-col h-full transition-all duration-300 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        {title && <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">{title}</h3>}
        {stats && (
          <div className="text-[10px] text-slate-400 space-x-3">
            <span>{stats.characters} chars</span>
            <span>{stats.words} words</span>
          </div>
        )}
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;

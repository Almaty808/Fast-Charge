
import React from 'react';
import { StationStatus } from '../types';

interface StatusBadgeProps {
  status: StationStatus;
}

const statusConfig: Record<StationStatus, { color: string, label: string }> = {
  [StationStatus.PLANNED]: { 
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/50', 
    label: 'В планах' 
  },
  [StationStatus.INSTALLED]: { 
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700/50', 
    label: 'Активна' 
  },
  [StationStatus.MAINTENANCE]: { 
    color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 border-primary-200/50 dark:border-primary-700/50', 
    label: 'Сервис' 
  },
  [StationStatus.REMOVED]: { 
    color: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300/50 dark:border-slate-600/50', 
    label: 'Снята' 
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

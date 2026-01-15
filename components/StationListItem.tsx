
import React, { useState } from 'react';
import { Station, StationStatus, User } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, TrashIcon, MapPinIcon, WhatsAppIcon, HistoryIcon, ChevronDownIcon, UsersIcon } from './Icons';

interface StationListItemProps {
  station: Station;
  isSelected: boolean;
  assignedUser?: User;
  onEdit: (station: Station) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: StationStatus) => void;
  onToggleSelection: (id: string) => void;
}

const StationListItem: React.FC<StationListItemProps> = ({ station, isSelected, assignedUser, onEdit, onDelete, onStatusChange, onToggleSelection }) => {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border-2 transition-all duration-300 overflow-hidden flex flex-col ${isSelected ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
      
      <div className="p-6 md:p-8 flex-1">
        <div className="flex justify-between items-start gap-4 mb-5">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate group-hover:text-primary-600 transition-colors">
              {station.locationName}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400 mt-1">
              <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
              <p className="text-xs font-medium truncate">{station.address}</p>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={station.status} />
          </div>
        </div>

        <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                <UsersIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ответственный</p>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">
                    {assignedUser ? assignedUser.name : 'Свободен'}
                </p>
            </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
            {station.sid && (
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                ID: {station.sid}
              </div>
            )}
            <div className="px-3 py-1 bg-primary-50 dark:bg-primary-900/10 rounded-lg text-[9px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest border border-primary-100/50 dark:border-primary-800/30">
              {new Date(station.installationDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </div>
        </div>

        {station.notes && (
          <div className="mb-4 p-4 bg-primary-50/20 dark:bg-primary-900/10 rounded-2xl border border-primary-100/10 italic">
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">"{station.notes}"</p>
          </div>
        )}

        {station.history && station.history.length > 0 && (
            <div className="mt-4 border-t border-slate-50 dark:border-slate-800 pt-4">
                <button
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-[0.1em] transition-colors"
                >
                    <HistoryIcon className="w-4 h-4" />
                    <span>История ({station.history.length})</span>
                    <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${isHistoryVisible ? 'rotate-180' : ''}`} />
                </button>
                {isHistoryVisible && (
                    <div className="space-y-3 mt-4 animate-fade-in">
                        {station.history.slice(-3).reverse().map(entry => (
                            <div key={entry.id} className="flex gap-3 pl-1 border-l-2 border-primary-100 dark:border-primary-900/30 ml-2">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{entry.change}</p>
                                    <p className="text-[8px] text-slate-400 mt-0.5">{new Date(entry.date).toLocaleDateString('ru-RU')} • {entry.employee}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="flex-1">
          <select 
            value={station.status} 
            onChange={(e) => onStatusChange(station.id, e.target.value as StationStatus)}
            className="w-full h-11 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white dark:bg-slate-800 py-2 px-4 border border-slate-200/50 dark:border-slate-700 shadow-sm text-slate-700 dark:text-slate-200 outline-none active:scale-[0.98] transition-all"
          >
            {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={() => onEdit(station)} 
            className="w-11 h-11 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary-600 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 border border-slate-200/50 dark:border-slate-700"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(station.id)} 
            className="w-11 h-11 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 border border-slate-200/50 dark:border-slate-700"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationListItem;

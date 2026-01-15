
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

  const formatWhatsAppLink = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return `https://wa.me/${digitsOnly}`;
  };

  return (
    <div className={`group relative bg-white dark:bg-slate-900 rounded-3xl md:rounded-[3rem] shadow-sm hover:shadow-md border-2 transition-all duration-300 overflow-hidden flex flex-col ${isSelected ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-100 dark:border-slate-800'}`}>
      
      {/* Main Content Area */}
      <div className="p-4 md:p-8 flex-1">
        <div className="flex justify-between items-start gap-3 mb-4 md:mb-6">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-primary-600 transition-colors tracking-tight truncate">
              {station.locationName}
            </h3>
            <div className="flex items-center gap-1.5 text-slate-400">
              <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
              <p className="text-xs md:text-sm font-medium truncate">{station.address}</p>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">
            <StatusBadge status={station.status} />
          </div>
        </div>

        {/* Индикатор ответственного - более компактный на мобильных */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                <UsersIcon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Ответственный</p>
                <p className="text-xs md:text-sm font-black text-slate-900 dark:text-slate-200 truncate">
                    {assignedUser ? assignedUser.name : 'Свободен'}
                </p>
            </div>
        </div>

        {/* Info Tags - компактнее */}
        <div className="flex flex-wrap gap-1.5 mb-4 md:mb-6">
            {station.sid && (
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ID: {station.sid}
              </div>
            )}
            <div className="px-3 py-1 bg-primary-50 dark:bg-primary-900/10 rounded-lg text-[9px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              {new Date(station.installationDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
            </div>
        </div>

        {/* На мобилках показываем только самое важное, остальное скрываем в историю */}
        {station.notes && (
          <div className="mb-4 p-4 bg-primary-50/30 dark:bg-primary-900/10 rounded-2xl border border-primary-100/30">
            <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-1 leading-relaxed italic">"{station.notes}"</p>
          </div>
        )}

        {/* History Toggle */}
        {station.history && station.history.length > 0 && (
            <div className="mt-auto">
                <button
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    className="flex items-center gap-2 text-[9px] font-black text-slate-400 hover:text-primary-500 uppercase tracking-widest"
                >
                    <HistoryIcon className="w-3.5 h-3.5" />
                    <span>Логи ({station.history.length})</span>
                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} />
                </button>
                {isHistoryVisible && (
                    <div className="space-y-3 pt-3 mt-3 animate-fade-in border-t border-slate-100 dark:border-slate-800">
                        {station.history.slice(-3).reverse().map(entry => (
                            <div key={entry.id} className="flex gap-3">
                                <div className="w-1 h-1 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{entry.change}</p>
                                    <p className="text-[9px] text-slate-400">{new Date(entry.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Action Footer - Оптимизирован для тапов */}
      <div className="px-4 md:px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex-1">
          <select 
            value={station.status} 
            onChange={(e) => onStatusChange(station.id, e.target.value as StationStatus)}
            className="w-full text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl bg-white dark:bg-slate-800 py-3 px-3 focus:ring-2 focus:ring-primary-500/10 text-slate-700 dark:text-slate-200 appearance-none border-none shadow-sm"
          >
            {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(station)} 
            className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-700 text-slate-400 hover:text-primary-600 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 border border-slate-100 dark:border-slate-600"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(station.id)} 
            className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-600 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 border border-slate-100 dark:border-slate-600"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationListItem;

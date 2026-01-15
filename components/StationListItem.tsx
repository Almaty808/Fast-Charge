
import React, { useState } from 'react';
import { Station, StationStatus } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, TrashIcon, MapPinIcon, WhatsAppIcon, HistoryIcon, ChevronDownIcon, PackageIcon } from './Icons';

interface StationListItemProps {
  station: Station;
  isSelected: boolean;
  onEdit: (station: Station) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: StationStatus) => void;
  onToggleSelection: (id: string) => void;
}

const StationListItem: React.FC<StationListItemProps> = ({ station, isSelected, onEdit, onDelete, onStatusChange, onToggleSelection }) => {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const formatWhatsAppLink = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return `https://wa.me/${digitsOnly}`;
  };

  return (
    <div className={`group relative bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl border-2 transition-all duration-300 overflow-hidden ${isSelected ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-slate-100 dark:border-slate-700'}`}>
      
      {/* Selection Checkbox Overlay */}
      <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(station.id)}
              className="h-6 w-6 rounded-full border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer shadow-sm"
              onClick={(e) => e.stopPropagation()}
          />
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              {station.locationName}
            </h3>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <MapPinIcon className="w-4 h-4 shrink-0" />
              <p className="text-sm font-medium truncate">{station.address}</p>
            </div>
          </div>
          <StatusBadge status={station.status} />
        </div>

        {/* Photos Grid */}
        {station.photos && station.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6 h-28">
            {station.photos.map((photo, index) => (
              <div key={index} className="relative group/photo overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <img 
                  src={photo} 
                  alt={`View ${index + 1}`} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/photo:scale-110"
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Info Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
            {station.sid && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <span className="opacity-50 text-[10px]">SID:</span> {station.sid}
              </div>
            )}
            {station.did && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <span className="opacity-50 text-[10px]">DID:</span> {station.did}
              </div>
            )}
        </div>

        {/* Free Users List */}
        {station.freeUsers && station.freeUsers.length > 0 && (
          <div className="space-y-3 mb-6">
              {station.freeUsers.slice(0, 2).map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-2xl border border-primary-100/50 dark:border-primary-900/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.fullName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{user.position || 'Персонал'}</p>
                  </div>
                  {user.phone && (
                    <a
                      href={formatWhatsAppLink(user.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-green-500 hover:scale-110 transition-transform active:scale-95"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Station Notes Snippet */}
        {station.notes && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border-l-4 border-primary-500 italic">
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">"{station.notes}"</p>
          </div>
        )}

        {/* History Toggle */}
        {station.history && station.history.length > 0 && (
            <div className="mb-2">
                <button
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary-500 transition-colors py-1 uppercase tracking-widest"
                >
                    <HistoryIcon className="w-4 h-4" />
                    <span>Логи ({station.history.length})</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-300 ${isHistoryVisible ? 'rotate-180' : ''}`} />
                </button>
                {isHistoryVisible && (
                    <div className="mt-3 space-y-3 pl-2 border-l-2 border-slate-200 dark:border-slate-700 animate-slide-up">
                        {station.history.slice(0, 3).map(entry => (
                            <div key={entry.id} className="text-[10px]">
                                <p className="font-bold text-slate-700 dark:text-slate-200">{entry.change}</p>
                                <p className="text-slate-400">{entry.employee} • {new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/20 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="flex-1">
          <select 
            value={station.status} 
            onChange={(e) => onStatusChange(station.id, e.target.value as StationStatus)}
            className="w-full text-xs font-bold rounded-xl border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 focus:ring-primary-500 transition-all cursor-pointer shadow-sm"
            disabled={station.status === StationStatus.REMOVED}
          >
            {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(station)} 
            className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all active:scale-90"
            disabled={station.status === StationStatus.REMOVED}
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(station.id)} 
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
            disabled={station.status === StationStatus.REMOVED}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationListItem;

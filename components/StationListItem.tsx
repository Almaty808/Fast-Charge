
import React, { useState } from 'react';
import { Station, StationStatus } from '../types';
import StatusBadge from './StatusBadge';
import { EditIcon, TrashIcon, MapPinIcon, WhatsAppIcon, HistoryIcon, ChevronDownIcon } from './Icons';

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
    <div className={`relative bg-white dark:bg-slate-800 rounded-lg shadow-md p-5 border flex flex-col justify-between transition-all duration-200 ${isSelected ? 'border-primary-500 ring-2 ring-primary-500/50' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="absolute top-4 left-4 z-10">
          <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(station.id)}
              className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
          />
      </div>
      
      <div>
        <div className="flex justify-between items-start mb-2 pl-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{station.locationName}</h3>
          <StatusBadge status={station.status} />
        </div>
        <div className="flex items-center gap-2 mb-4 pl-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">{station.address}</p>
          {station.coordinates && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${station.coordinates.lat}&mlon=${station.coordinates.lng}#map=18/${station.coordinates.lat}/${station.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Показать на карте"
              className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <MapPinIcon className="w-5 h-5" />
            </a>
          )}
        </div>

        {station.photos && station.photos.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {station.photos.map((photo, index) => (
              <img 
                key={index} 
                src={photo} 
                alt={`Station view ${index + 1}`} 
                className="h-24 w-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 shadow-sm"
              />
            ))}
          </div>
        )}

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 mb-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-2">
          <p><strong>Установщик:</strong> {station.installer}</p>
          <p><strong>Дата:</strong> {new Date(station.installationDate).toLocaleDateString('ru-RU')}</p>
          {station.sid && <p><strong>SID:</strong> {station.sid}</p>}
          {station.did && <p><strong>DID:</strong> {station.did}</p>}
          {station.sim && <p><strong>SIM:</strong> {station.sim}</p>}
        </div>

        {station.freeUsers && station.freeUsers.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Бесплатные пользователи:</h4>
            <ul className="space-y-3">
              {station.freeUsers.map(user => (
                <li key={user.id} className="text-xs bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{user.fullName}</p>
                  {user.position && <p className="text-slate-500 dark:text-slate-400">{user.position}</p>}
                  {user.phone && (
                    <a
                      href={formatWhatsAppLink(user.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors group mt-1"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 text-green-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                      <span>{user.phone}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {station.notes && (
          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
            <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{station.notes}</p>
          </div>
        )}
        
        {station.history && station.history.length > 0 && (
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                <button
                    onClick={() => setIsHistoryVisible(!isHistoryVisible)}
                    className="w-full flex justify-between items-center text-left text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <HistoryIcon className="w-4 h-4" />
                        <span>История изменений ({station.history.length})</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} />
                </button>
                {isHistoryVisible && (
                    <div className="mt-3 pl-2 border-l-2 border-slate-200 dark:border-slate-600 space-y-3 max-h-48 overflow-y-auto pr-2">
                        {station.history.map(entry => (
                            <div key={entry.id} className="text-xs">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">{entry.change}</p>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {new Date(entry.date).toLocaleString('ru-RU')} - {entry.employee}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="w-full sm:w-auto mb-2 sm:mb-0">
          <select 
            value={station.status} 
            onChange={(e) => onStatusChange(station.id, e.target.value as StationStatus)}
            className="w-full text-sm rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            disabled={station.status === StationStatus.REMOVED}
          >
            {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(station)} className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"  disabled={station.status === StationStatus.REMOVED}>
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(station.id)} className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition-colors" disabled={station.status === StationStatus.REMOVED}>
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationListItem;


import React from 'react';
import { Station, StationStatus, User } from '../types';
import StationListItem from './StationListItem';

interface StationListProps {
  stations: Station[];
  selectedStations: Set<string>;
  allUsers: User[];
  onEdit: (station: Station) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: StationStatus) => void;
  onToggleSelection: (id: string) => void;
}

const StationList: React.FC<StationListProps> = ({ stations, selectedStations, allUsers, ...props }) => {
  if (stations.length === 0) {
    return (
      <div className="text-center py-16 md:py-24 px-6 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-slate-300">
            <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Ничего не найдено</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium max-w-xs mx-auto">Попробуйте изменить поисковый запрос.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
      {stations.map(station => (
        <StationListItem 
          key={station.id} 
          station={station} 
          isSelected={selectedStations.has(station.id)}
          assignedUser={allUsers.find(u => u.id === station.assignedUserId)}
          {...props} 
        />
      ))}
    </div>
  );
};

export default StationList;

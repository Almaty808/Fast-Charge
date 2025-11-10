
import React from 'react';
import { Station, StationStatus } from '../types';
import StationListItem from './StationListItem';

interface StationListProps {
  stations: Station[];
  selectedStations: Set<string>;
  onEdit: (station: Station) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: StationStatus) => void;
  onToggleSelection: (id: string) => void;
}

const StationList: React.FC<StationListProps> = ({ stations, selectedStations, ...props }) => {
  if (stations.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Станции не найдены</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Попробуйте изменить фильтры или поисковый запрос.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stations.map(station => (
        <StationListItem 
          key={station.id} 
          station={station} 
          isSelected={selectedStations.has(station.id)}
          {...props} 
        />
      ))}
    </div>
  );
};

export default StationList;
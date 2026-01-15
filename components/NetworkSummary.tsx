
import React, { useState, useMemo } from 'react';
import { Station, StationStatus } from '../types';
import StatusBadge from './StatusBadge';
import { MapPinIcon, ChevronDownIcon, SearchIcon } from './Icons';

interface NetworkSummaryProps {
  stations: Station[];
}

interface CityStats {
  count: number;
  stations: Station[];
}

const NetworkSummary: React.FC<NetworkSummaryProps> = ({ stations }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const extractCity = (address: string) => {
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || 'Другие';
  };

  // Aggregate all stations by city (not just installed, to show full context)
  const cityData = useMemo(() => {
    return stations.reduce((acc, station) => {
      const city = extractCity(station.address);
      if (!acc[city]) {
        acc[city] = {
          count: 0,
          stations: []
        };
      }
      if (station.status === StationStatus.INSTALLED) {
        acc[city].count += 1;
      }
      acc[city].stations.push(station);
      return acc;
    }, {} as Record<string, CityStats>);
  }, [stations]);

  const cities = useMemo(() => 
    (Object.entries(cityData) as [string, CityStats][])
      .sort((a, b) => b[1].count - a[1].count),
    [cityData]
  );

  if (stations.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Нет данных о станциях</p>
      </div>
    );
  }

  const selectedCityData = selectedCity ? cityData[selectedCity] : null;

  return (
    <div className="space-y-8 animate-slide-up pb-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Покрытие сети</h2>
        <p className="text-slate-500 font-medium mt-2">Нажмите на город для просмотра списка всех объектов</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(([cityName, data]) => (
          <button 
            key={cityName} 
            onClick={() => setSelectedCity(cityName)}
            className="group text-left bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:scale-[1.02] hover:border-primary-500/50 transition-all duration-300 relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-colors" />
            
            <div className="flex justify-between items-start mb-6 relative">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{cityName}</h3>
                <div className="mt-2 h-1.5 w-12 bg-primary-500 rounded-full group-hover:w-20 transition-all duration-500" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-4xl font-black text-primary-600 leading-none">{data.count}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mt-1">активных</span>
              </div>
            </div>

            <div className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Объектов всего: {data.stations.length}</p>
                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                   <ChevronDownIcon className="w-4 h-4 -rotate-90" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.stations.slice(0, 3).map((station, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                    {station.locationName}
                  </span>
                ))}
                {data.stations.length > 3 && (
                  <span className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-[10px] font-bold text-primary-600">
                    +{data.stations.length - 3} еще
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* City Detail Modal */}
      {selectedCity && selectedCityData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
           <div className="bg-white dark:bg-slate-900 w-full max-w-3xl md:rounded-[3rem] shadow-2xl h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col animate-mobile-form md:animate-slide-up overflow-hidden border border-white/20">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                          <MapPinIcon className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedCity}</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Список всех локаций города</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCity(null)}
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                  >
                    ✕
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4 scrollbar-hide">
                  {selectedCityData.stations.map((station) => (
                    <div 
                      key={station.id}
                      className="group p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-md"
                    >
                        <div className="flex-1 min-w-0">
                            <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                                {station.locationName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{station.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            <StatusBadge status={station.status} />
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                ID: {station.sid || 'N/A'}
                            </div>
                        </div>
                    </div>
                  ))}
              </div>

              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center pb-safe">
                  <button 
                    onClick={() => setSelectedCity(null)}
                    className="w-full md:w-auto px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    Закрыть обзор
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSummary;

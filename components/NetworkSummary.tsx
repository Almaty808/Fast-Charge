
import React from 'react';
import { Station, StationStatus } from '../types';

interface NetworkSummaryProps {
  stations: Station[];
}

// Define an interface to resolve TypeScript 'unknown' type errors for the aggregated city data.
interface CityStats {
  count: number;
  locations: string[];
}

const NetworkSummary: React.FC<NetworkSummaryProps> = ({ stations }) => {
  // Helper to extract city from address (assuming city is the last part after the last comma)
  const extractCity = (address: string) => {
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || 'Другие';
  };

  const activeStations = stations.filter(s => s.status === StationStatus.INSTALLED);
  
  // Aggregate stations by city with explicit typing to prevent 'unknown' property access errors.
  const cityData = activeStations.reduce((acc, station) => {
    const city = extractCity(station.address);
    if (!acc[city]) {
      acc[city] = {
        count: 0,
        locations: []
      };
    }
    acc[city].count += 1;
    acc[city].locations.push(station.locationName);
    return acc;
  }, {} as Record<string, CityStats>);

  // Cast Object.entries to a specific type to allow property access like 'count' and 'locations' during sorting and mapping.
  const cities = (Object.entries(cityData) as [string, CityStats][]).sort((a, b) => b[1].count - a[1].count);

  if (activeStations.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Нет установленных станций</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Покрытие сети</h2>
        <p className="text-slate-500 font-medium">Статистика по городам и локациям</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(([cityName, data]) => (
          <div key={cityName} className="group bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{cityName}</h3>
                <div className="mt-1 h-1.5 w-12 bg-primary-500 rounded-full" />
              </div>
              <div className="flex flex-col items-end">
                {/* Fixed: Accessing 'count' on typed 'data' object */}
                <span className="text-4xl font-black text-primary-600 leading-none">{data.count}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter mt-1">станций</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Локации:</p>
              <div className="flex flex-wrap gap-2">
                {/* Fixed: Accessing 'locations' on typed 'data' object */}
                {data.locations.map((loc, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkSummary;

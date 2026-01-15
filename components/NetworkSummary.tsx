
import React, { useState, useMemo } from 'react';
import { Station, StationStatus, User } from '../types';
import StatusBadge from './StatusBadge';
import { 
    MapPinIcon, 
    ChevronDownIcon, 
    EditIcon, 
    TrashIcon, 
    UsersIcon, 
    BoltIcon, 
    ShieldCheckIcon, 
    SignalIcon, 
    FireIcon,
    ChartPieIcon
} from './Icons';

interface NetworkSummaryProps {
  stations: Station[];
  allUsers: User[];
  isAdmin?: boolean;
  onEdit: (station: Station) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: StationStatus) => void;
}

interface CityStats {
  count: number;
  stations: Station[];
}

const NetworkSummary: React.FC<NetworkSummaryProps> = ({ stations, allUsers, isAdmin, onEdit, onDelete, onStatusChange }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const extractCity = (address: string) => {
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || 'Разное';
  };

  // Глобальные KPI
  const globalStats = useMemo(() => {
    const total = stations.length;
    const installed = stations.filter(s => s.status === StationStatus.INSTALLED).length;
    const maintenance = stations.filter(s => s.status === StationStatus.MAINTENANCE).length;
    const planned = stations.filter(s => s.status === StationStatus.PLANNED).length;
    const activeSIMs = stations.filter(s => s.status === StationStatus.INSTALLED && s.sim).length;

    return {
      total,
      installed,
      maintenance,
      planned,
      activeSIMs,
      efficiency: total > 0 ? Math.round((installed / total) * 100) : 0
    };
  }, [stations]);

  // Статистика по сотрудникам (лидерборд)
  const userPerformance = useMemo(() => {
    return allUsers.map(user => {
        const userStations = stations.filter(s => s.assignedUserId === user.id);
        const installed = userStations.filter(s => s.status === StationStatus.INSTALLED).length;
        return {
            ...user,
            totalAssigned: userStations.length,
            installedCount: installed
        };
    }).sort((a, b) => b.installedCount - a.installedCount).slice(0, 5);
  }, [stations, allUsers]);

  const cityData = useMemo(() => {
    return stations.reduce((acc, station) => {
      const city = extractCity(station.address);
      if (!acc[city]) {
        acc[city] = { count: 0, stations: [] };
      }
      if (station.status === StationStatus.INSTALLED) acc[city].count += 1;
      acc[city].stations.push(station);
      return acc;
    }, {} as Record<string, CityStats>);
  }, [stations]);

  const cities: [string, CityStats][] = useMemo(() => 
    (Object.entries(cityData) as [string, CityStats][]).sort((a, b) => b[1].count - a[1].count),
    [cityData]
  );

  return (
    <div className="space-y-12 animate-slide-up pb-32">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex px-4 py-1 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
            Центр управления данными
          </div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge Analytics</h2>
          <p className="text-slate-500 font-bold max-w-lg">Глубокий анализ покрытия сети, эффективности команды и статуса оборудования.</p>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Общий охват', val: globalStats.total, icon: MapPinIcon, sub: 'Всего точек в базе', color: 'from-blue-600 to-blue-700' },
            { label: 'Эффективность', val: `${globalStats.efficiency}%`, icon: ShieldCheckIcon, sub: 'Объектов установленно', color: 'from-emerald-600 to-emerald-700' },
            { label: 'Активные SIM', val: globalStats.activeSIMs, icon: SignalIcon, sub: 'Станции онлайн', color: 'from-primary-600 to-indigo-700' },
            { label: 'Технический долг', val: globalStats.maintenance, icon: FireIcon, sub: 'Требуют сервиса', color: 'from-rose-600 to-rose-700' }
        ].map((item, idx) => (
            <div key={idx} className={`relative overflow-hidden bg-gradient-to-br ${item.color} p-8 rounded-[2.5rem] text-white shadow-xl group hover:scale-[1.02] transition-transform`}>
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-500">
                    <item.icon className="w-16 h-16" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">{item.label}</p>
                    <p className="text-4xl font-black tracking-tighter mb-4">{item.val}</p>
                    <div className="h-1 w-8 bg-white/40 rounded-full mb-3" />
                    <p className="text-[10px] font-bold opacity-70">{item.sub}</p>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* NETWORK HEALTH STATUS CHART (CSS-based) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="mb-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Состояние сети</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Распределение статусов в реальном времени</p>
            </div>
            
            <div className="space-y-8">
                <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex shadow-inner">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-1000 border-r-2 border-white dark:border-slate-900" 
                        style={{ width: `${(globalStats.installed / globalStats.total) * 100}%` }}
                        title="Установлено"
                    />
                    <div 
                        className="h-full bg-amber-500 transition-all duration-1000 border-r-2 border-white dark:border-slate-900" 
                        style={{ width: `${(globalStats.planned / globalStats.total) * 100}%` }}
                        title="Запланировано"
                    />
                    <div 
                        className="h-full bg-primary-500 transition-all duration-1000" 
                        style={{ width: `${(globalStats.maintenance / globalStats.total) * 100}%` }}
                        title="Сервис"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                        <div>
                            <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{globalStats.installed}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Активно</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <div>
                            <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{globalStats.planned}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">В планах</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary-500 rounded-full" />
                        <div>
                            <p className="text-sm font-black text-slate-800 dark:text-white leading-none">{globalStats.maintenance}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Обслуживание</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-10 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    <span className="font-black text-primary-600">Подсказка ИИ:</span> Наибольшая концентрация «плановых» объектов в г. Алматы. Рекомендуется перераспределить ресурсы монтажной бригады для ускорения масштабирования.
                </p>
            </div>
        </div>

        {/* TOP PERFORMERS LEADERBOARD */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Топ исполнителей</h3>
            <div className="space-y-6">
                {userPerformance.map((user, idx) => (
                    <div key={user.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${
                                idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>
                                {idx + 1}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-slate-800 dark:text-white truncate">{user.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Завершено: {user.installedCount}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-primary-600 leading-none">
                                {user.totalAssigned > 0 ? Math.round((user.installedCount / user.totalAssigned) * 100) : 0}%
                            </div>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">КПД</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-10 py-4 bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                Полный список
            </button>
        </div>
      </div>

      {/* REGIONAL BREAKDOWN */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
                <MapPinIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Региональное покрытие</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map(([cityName, data]) => (
            <button 
                key={cityName} 
                onClick={() => setSelectedCity(cityName)}
                className="group relative bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.04)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-700 overflow-hidden text-left"
            >
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{cityName}</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Узел сети</p>
                    </div>
                    <div className="bg-primary-50 dark:bg-primary-900/30 w-16 h-16 rounded-3xl flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-3xl shadow-sm border border-primary-100/50 dark:border-primary-800/30">
                        {data.count}
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex-1">
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${(data.count / data.stations.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Активность: {Math.round((data.count / data.stations.length) * 100)}%
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Всего: {data.stations.length}
                        </p>
                    </div>
                    </div>
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-sm">
                    <ChevronDownIcon className="w-6 h-6 -rotate-90" />
                    </div>
                </div>
                </div>
            </button>
            ))}
        </div>
      </div>

      {/* CITY DETAIL MODAL (REUSED & ENHANCED) */}
      {selectedCity && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-5xl md:rounded-[4rem] shadow-2xl h-[95vh] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden border border-white/5 animate-slide-up">
              <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4 md:gap-8 min-w-0">
                      <div className="hidden sm:flex w-14 h-14 md:w-20 md:h-20 bg-primary-600 rounded-2xl md:rounded-[2rem] items-center justify-center text-white shadow-2xl shadow-primary-500/30 transform -rotate-3 shrink-0">
                          <MapPinIcon className="w-6 h-6 md:w-10 md:h-10" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{selectedCity}</h3>
                        <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Реестр локаций</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCity(null)} 
                    className="w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all border border-slate-100 dark:border-slate-700 shadow-sm shrink-0"
                  >
                    ✕
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 scrollbar-hide">
                  {cityData[selectedCity].stations.map((s) => (
                    <div key={s.id} className="group p-4 md:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl md:rounded-[3rem] border border-transparent hover:border-primary-100 flex flex-col gap-4 transition-all hover:bg-white dark:hover:bg-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors tracking-tight truncate">{s.locationName}</h4>
                                <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate mt-1">{s.address}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 shrink-0">
                                <StatusBadge status={s.status} />
                                {isAdmin && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEdit(s)}
                                            className="w-10 h-10 bg-white dark:bg-slate-700 text-slate-400 hover:text-primary-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all active:scale-90"
                                            title="Редактировать"
                                        >
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => onDelete(s.id)}
                                            className="w-10 h-10 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-600 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all active:scale-90"
                                            title="Удалить"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Team Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/50 gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <UsersIcon className="w-4 h-4" />
                                    <span>
                                        {allUsers.find(u => u.id === s.assignedUserId)?.name || 'Не назначен'}
                                    </span>
                                </div>
                                {s.sid && (
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        <BoltIcon className="w-3 h-3" />
                                        <span>{s.sid}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="w-full sm:w-auto flex gap-3">
                                <select 
                                    value={s.status} 
                                    onChange={(e) => onStatusChange(s.id, e.target.value as StationStatus)}
                                    className="flex-1 sm:w-40 text-[9px] font-black uppercase tracking-widest rounded-xl bg-white dark:bg-slate-700 py-2.5 px-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 appearance-none shadow-sm"
                                >
                                    {Object.values(StationStatus).map(st => <option key={st} value={st}>{st}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                  ))}
              </div>

              <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center pb-safe shrink-0">
                  <button onClick={() => setSelectedCity(null)} className="w-full md:w-auto px-16 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Закрыть аналитику города</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSummary;

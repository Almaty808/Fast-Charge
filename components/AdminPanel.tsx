
import React, { useState, useMemo } from 'react';
import { User, UserStatus, UserRole, Station, StationStatus, AppNotification, UserGroup, AppPermission } from '../types';
import StatusBadge from './StatusBadge';
import { 
    UsersIcon, 
    ChartIcon, 
    CogIcon, 
    ClockIcon, 
    PackageIcon, 
    MapPinIcon, 
    TrashIcon, 
    EditIcon, 
    CheckIcon,
    PlusIcon,
    SearchIcon,
    PhoneIcon,
    WhatsAppIcon,
    BellIcon,
    EnvelopeIcon,
    HistoryIcon,
    DownloadIcon,
    ChevronDownIcon
} from './Icons';

interface AdminPanelProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    stations: Station[];
    setStations: React.Dispatch<React.SetStateAction<Station[]>>;
    userGroups: UserGroup[];
    setUserGroups: React.Dispatch<React.SetStateAction<UserGroup[]>>;
    inventoryCount: number;
    setInventoryCount: React.Dispatch<React.SetStateAction<number>>;
    notifications: AppNotification[];
    onEditStation: (station: Station) => void;
    onDeleteStation: (id: string) => void;
    onStatusChange: (id: string, status: StationStatus) => void;
    onAddStation: () => void;
    onBack: () => void;
    onSendMessage: (msg: string, type: AppNotification['type'], userId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    users, setUsers, stations, setStations, userGroups, setUserGroups, inventoryCount, setInventoryCount, notifications,
    onEditStation, onDeleteStation, onStatusChange, onAddStation, onBack, onSendMessage
}) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stations' | 'groups' | 'logs' | 'settings'>('dashboard');
    const [stationSearch, setStationSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [msgModal, setMsgModal] = useState<{ userId: string, type: 'push' | 'email' } | null>(null);
    const [msgBody, setMsgBody] = useState('');
    
    // Group Form State
    const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
    const [groupData, setGroupData] = useState({ name: '', description: '', permissions: [] as AppPermission[] });

    const stats = useMemo(() => ({
        total: stations.length,
        installed: stations.filter(s => s.status === StationStatus.INSTALLED).length,
        maintenance: stations.filter(s => s.status === StationStatus.MAINTENANCE).length,
        pendingUsers: users.filter(u => u.status === UserStatus.PENDING).length,
        activeUsers: users.filter(u => u.status === UserStatus.APPROVED).length
    }), [stations, users]);

    const filteredStations = useMemo(() => 
        stations.filter(s => s.locationName.toLowerCase().includes(stationSearch.toLowerCase()) || s.address.toLowerCase().includes(stationSearch.toLowerCase())),
    [stations, stationSearch]);

    const filteredUsers = useMemo(() => 
        users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())),
    [users, userSearch]);

    const handleSend = () => {
        if (!msgBody || !msgModal) return;
        onSendMessage(msgBody, msgModal.type === 'push' ? 'push' : 'email', msgModal.userId);
        setMsgModal(null);
        setMsgBody('');
    };

    const handleOpenGroupForm = (group: UserGroup | null = null) => {
        if (group) {
            setEditingGroup(group);
            setGroupData({ name: group.name, description: group.description, permissions: group.permissions });
        } else {
            setEditingGroup(null);
            setGroupData({ name: '', description: '', permissions: [] });
        }
        setIsGroupFormOpen(true);
    };

    const handleSaveGroup = () => {
        if (!groupData.name) return;
        if (editingGroup) {
            setUserGroups(groups => groups.map(g => g.id === editingGroup.id ? { ...g, ...groupData } : g));
        } else {
            const newGroup: UserGroup = {
                id: 'g-' + Date.now(),
                ...groupData
            };
            setUserGroups(groups => [...groups, newGroup]);
        }
        setIsGroupFormOpen(false);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Рабочий стол', icon: ChartIcon },
        { id: 'stations', label: 'Объекты сети', icon: MapPinIcon },
        { id: 'users', label: 'Персонал', icon: UsersIcon, badge: stats.pendingUsers > 0 },
        { id: 'groups', label: 'Доступы', icon: CogIcon },
        { id: 'logs', label: 'Активность', icon: HistoryIcon },
        { id: 'settings', label: 'Склад', icon: PackageIcon },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-['Plus_Jakarta_Sans']">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shrink-0">
                <div className="p-8 pb-10 flex items-center gap-3">
                    <div className="bg-primary-600 p-2 rounded-2xl shadow-lg shadow-primary-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge</h1>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none mt-1">HQ Dashboard</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto scrollbar-hide">
                    <p className="px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Основное меню</p>
                    {menuItems.map(item => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id as any)} 
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative group ${
                                activeTab === item.id 
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' 
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && <span className="absolute right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500/50" />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        Вернуться назад
                    </button>
                </div>
            </aside>

            {/* Main Content Viewport */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Desktop Top Header */}
                <header className="hidden lg:flex h-20 items-center justify-between px-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 z-30">
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Fast Charge / {menuItems.find(i => i.id === activeTab)?.label}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 pr-6 border-r border-slate-200 dark:border-slate-700">
                             <div className="text-right">
                                <p className="text-sm font-black text-slate-900 dark:text-white">Admin Master</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase">В сети</p>
                             </div>
                             <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-black">A</div>
                        </div>
                        <button className="relative p-2 text-slate-400 hover:text-primary-600 transition-colors">
                            <BellIcon className="w-6 h-6" />
                            {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />}
                        </button>
                    </div>
                </header>

                {/* Mobile Top Tabs (Visible only on mobile) */}
                <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 shrink-0 overflow-x-auto scrollbar-hide pt-safe sticky top-0 z-50">
                    <div className="flex gap-6 py-4 min-w-max">
                        {menuItems.map(item => (
                            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'text-primary-600 border-b-2 border-primary-600 pb-2' : 'text-slate-400'}`}>
                                <item.icon className="w-4 h-4" /> {item.label.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
                    <div className="max-w-[1400px] mx-auto space-y-8 animate-slide-up">
                        
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Объектов', val: stats.total, icon: MapPinIcon, col: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                                        { label: 'Установлено', val: stats.installed, icon: CheckIcon, col: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                        { label: 'Сотрудников', val: stats.activeUsers, icon: UsersIcon, col: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                                        { label: 'На складе', val: inventoryCount, icon: PackageIcon, col: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                    ].map((s, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                                            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-6 shadow-sm`}>
                                                <s.icon className={`w-7 h-7 ${s.col}`} />
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                            <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">{s.val}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 space-y-8">
                                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm overflow-hidden relative">
                                            <div className="flex justify-between items-center mb-8 relative z-10">
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Статистика установки</h3>
                                                    <p className="text-sm text-slate-500 font-medium">Активность за последние 30 дней</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-[10px] font-black rounded-lg">МЕСЯЦ</span>
                                                </div>
                                            </div>
                                            {/* Simulated Chart */}
                                            <div className="h-64 flex items-end gap-2 relative z-10">
                                                {[40, 60, 45, 90, 65, 80, 50, 70, 85, 40, 55, 75, 95, 60, 40].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-primary-100 dark:bg-primary-900/20 rounded-t-xl relative group">
                                                        <div 
                                                            className="absolute bottom-0 left-0 right-0 bg-primary-600 rounded-t-xl transition-all duration-1000 ease-out group-hover:bg-primary-400" 
                                                            style={{ height: `${h}%` }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm">
                                            <div className="flex justify-between items-center mb-8">
                                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Новые объекты</h3>
                                                <button onClick={onAddStation} className="text-xs font-black text-primary-600 uppercase tracking-widest flex items-center gap-1 hover:underline"><PlusIcon className="w-4 h-4" /> Добавить</button>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                                                            <th className="pb-4 px-2">Локация</th>
                                                            <th className="pb-4 px-2">Статус</th>
                                                            <th className="pb-4 px-2">Установщик</th>
                                                            <th className="pb-4 px-2 text-right">Действие</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                        {stations.slice(0, 5).map(s => (
                                                            <tr key={s.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                                <td className="py-5 px-2">
                                                                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors">{s.locationName}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{s.address}</p>
                                                                </td>
                                                                <td className="py-5 px-2">
                                                                    <StatusBadge status={s.status} />
                                                                </td>
                                                                <td className="py-5 px-2 text-xs font-bold text-slate-500">
                                                                    {s.installer}
                                                                </td>
                                                                <td className="py-5 px-2 text-right">
                                                                    <button onClick={() => onEditStation(s)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"><EditIcon className="w-5 h-5" /></button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                            <h4 className="text-2xl font-black mb-2 tracking-tight">Управление сетью</h4>
                                            <p className="text-sm opacity-80 mb-10 font-medium leading-relaxed">Быстрый доступ к мониторингу всех установленных станций и их текущему состоянию в реальном времени.</p>
                                            <button onClick={() => setActiveTab('stations')} className="w-full py-5 bg-white text-primary-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-colors active:scale-95">Смотреть все объекты</button>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-sm">
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Лог событий</h3>
                                            <div className="space-y-6">
                                                {notifications.slice(0, 6).map(n => (
                                                    <div key={n.id} className="flex gap-4 items-start group">
                                                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                                                            n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                                            n.type === 'assignment' ? 'bg-primary-50 text-primary-600' :
                                                            'bg-slate-50 text-slate-500'
                                                        }`}>
                                                            {n.type === 'assignment' ? <MapPinIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs text-slate-800 dark:text-slate-200 font-black leading-tight truncate">{n.message}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{n.author}</span>
                                                                <span className="text-[9px] text-slate-300">• {new Date(n.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveTab('logs')} className="w-full mt-8 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-colors">Вся активность</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'stations' && (
                            <div className="space-y-8">
                                <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                                    <div className="relative w-full xl:w-[500px]">
                                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input value={stationSearch} onChange={e => setStationSearch(e.target.value)} placeholder="Поиск объектов по названию или адресу..." className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-sm text-sm focus:ring-4 focus:ring-primary-500/10 transition-all font-medium" />
                                    </div>
                                    <div className="flex gap-4 w-full xl:w-auto">
                                        <button onClick={onAddStation} className="flex-1 xl:flex-none px-10 py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                                            <PlusIcon className="w-5 h-5" /> Добавить станцию
                                        </button>
                                        <button className="px-6 py-5 bg-white dark:bg-slate-900 text-slate-400 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:text-primary-600 transition-colors">
                                            <DownloadIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <th className="px-10 py-6">Объект</th>
                                                    <th className="px-10 py-6">ID Система</th>
                                                    <th className="px-10 py-6">Установщик</th>
                                                    <th className="px-10 py-6">Статус</th>
                                                    <th className="px-10 py-6 text-right">Действия</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                                {filteredStations.map(s => (
                                                    <tr key={s.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all">
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary-500 shrink-0">
                                                                    <MapPinIcon className="w-6 h-6" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-base font-black text-slate-900 dark:text-white truncate">{s.locationName}</p>
                                                                    <p className="text-xs text-slate-400 font-medium truncate max-w-[300px]">{s.address}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded inline-block">SID: {s.sid || '---'}</p>
                                                                <p className="text-[10px] font-black text-slate-400 block">DID: {s.did || '---'}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.installer}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{s.installationDate}</p>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <StatusBadge status={s.status} />
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => onEditStation(s)} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"><EditIcon className="w-5 h-5" /></button>
                                                                <button onClick={() => onDeleteStation(s.id)} className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"><TrashIcon className="w-5 h-5" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {filteredStations.length === 0 && (
                                        <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Ничего не найдено</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="space-y-8">
                                <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
                                    <div className="relative w-full xl:w-[500px]">
                                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Поиск по имени или Email..." className="w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border-none shadow-sm text-sm focus:ring-4 focus:ring-primary-500/10 transition-all font-medium" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="px-8 py-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Всего в штате:</span>
                                            <span className="text-xl font-black text-primary-600">{users.length}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredUsers.map(u => (
                                        <div key={u.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">{u.name.charAt(0)}</div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white">{u.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-primary-600 font-black uppercase tracking-widest">{u.role}</span>
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${u.status === UserStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{u.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setMsgModal({ userId: u.id, type: 'push' })} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-primary-500 hover:bg-primary-600 hover:text-white transition-all"><BellIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => setMsgModal({ userId: u.id, type: 'email' })} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all"><EnvelopeIcon className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4 mb-8">
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium"><PhoneIcon className="w-4 h-4 text-slate-300" /> {u.phone}</div>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium"><EnvelopeIcon className="w-4 h-4 text-slate-300" /> {u.email}</div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Группа прав доступа</label>
                                                    <select 
                                                        value={u.groupId || ''} 
                                                        onChange={(e) => setUsers(us => us.map(user => user.id === u.id ? { ...user, groupId: e.target.value } : user))}
                                                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300"
                                                    >
                                                        <option value="">Без группы</option>
                                                        {userGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                    </select>
                                                </div>
                                                {u.status === UserStatus.PENDING && (
                                                    <button onClick={() => setUsers(us => us.map(x => x.id === u.id ? {...x, status: UserStatus.APPROVED} : x))} className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform">Активировать аккаунт</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'groups' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Управление группами</h3>
                                        <p className="text-sm text-slate-500 font-medium">Создание ролей и распределение разрешений</p>
                                    </div>
                                    <button onClick={() => handleOpenGroupForm()} className="px-10 py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <PlusIcon className="w-5 h-5" /> Новая группа
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {userGroups.map(group => (
                                        <div key={group.id} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white truncate">{group.name}</h4>
                                                    <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-2">{group.description}</p>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button onClick={() => handleOpenGroupForm(group)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all"><EditIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => { if(confirm('Удалить группу?')) setUserGroups(gs => gs.filter(g => g.id !== group.id)) }} className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all"><TrashIcon className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Разрешения ({group.permissions.length})</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {group.permissions.map(perm => (
                                                        <span key={perm} className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100/50 dark:border-slate-700">
                                                            {perm}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'logs' && (
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Журнал активности штата</h3>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"><DownloadIcon className="w-4 h-4" /> Экспорт CSV</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <th className="px-10 py-6">Исполнитель</th>
                                                <th className="px-10 py-6">Действие</th>
                                                <th className="px-10 py-6">Тип</th>
                                                <th className="px-10 py-6 text-right">Дата и время</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                            {notifications.map(n => (
                                                <tr key={n.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-black text-sm">{n.author.charAt(0)}</div>
                                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">{n.author}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-sm text-slate-500 dark:text-slate-400 font-medium">{n.message}</td>
                                                    <td className="px-10 py-6">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                            n.type === 'assignment' ? 'bg-primary-50 text-primary-600' :
                                                            n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                                            n.type === 'push' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-slate-100 text-slate-400'
                                                        }`}>{n.type}</span>
                                                    </td>
                                                    <td className="px-10 py-6 text-xs text-slate-400 font-bold text-right tracking-tighter">
                                                        {new Date(n.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] text-center shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="w-24 h-24 bg-primary-50 dark:bg-primary-900/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                        <PackageIcon className="w-12 h-12 text-primary-600" />
                                    </div>
                                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Учет товарных запасов</h4>
                                    <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto font-medium">Количество портативных станций, доступных для новых инсталляций.</p>
                                    <div className="text-[10rem] font-black text-primary-600 tracking-tighter leading-none mb-12 select-none">{inventoryCount}</div>
                                    <div className="flex gap-6 justify-center">
                                        <button onClick={() => setInventoryCount(c => Math.max(0, c - 1))} className="w-24 h-24 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center text-4xl font-black shadow-xl shadow-rose-500/10 active:scale-95 transition-all">-1</button>
                                        <button onClick={() => setInventoryCount(c => c + 1)} className="w-24 h-24 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center text-4xl font-black shadow-xl shadow-emerald-500/10 active:scale-95 transition-all">+1</button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800">
                                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Параметры платформы</h4>
                                        <div className="space-y-4">
                                            {[
                                                { label: 'Push-уведомления', desc: 'Задания монтажникам' },
                                                { label: 'ИИ Генерация', desc: 'Авто-заметки Gemini' },
                                                { label: 'Email логирование', desc: 'Ежедневные отчеты' },
                                                { label: 'Тёмный режим HQ', desc: 'Интерфейс панели' },
                                            ].map((pref, i) => (
                                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all">
                                                    <div>
                                                        <p className="text-base font-black text-slate-800 dark:text-slate-200">{pref.label}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pref.desc}</p>
                                                    </div>
                                                    <div className="w-14 h-8 bg-primary-600 rounded-full relative shadow-inner cursor-pointer">
                                                        <div className="absolute right-1 top-1 w-6 h-6 bg-white rounded-full shadow-md" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-slate-900 dark:text-white">Безопасность данных</p>
                                            <p className="text-xs text-slate-500 font-medium">Все операции защищены и логируются в системе.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Global Modals */}
            
            {/* Group Modal */}
            {isGroupFormOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[110] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] p-12 animate-slide-up border border-white/10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{editingGroup ? 'Правка прав' : 'Новая роль'}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Настройка функциональных разрешений</p>
                            </div>
                            <button onClick={() => setIsGroupFormOpen(false)} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all">✕</button>
                        </div>
                        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Название группы</label>
                                <input value={groupData.name} onChange={e => setGroupData({...groupData, name: e.target.value})} placeholder="Напр. Супервайзеры" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none font-black text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Описание обязанностей</label>
                                <textarea value={groupData.description} onChange={e => setGroupData({...groupData, description: e.target.value})} placeholder="Кратко опишите за что отвечает эта роль..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border-none text-sm h-32 resize-none font-medium focus:ring-4 focus:ring-primary-500/10 transition-all" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Список разрешений</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {Object.values(AppPermission).map(perm => (
                                        <label key={perm} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] cursor-pointer hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all group">
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-300 group-hover:text-primary-600 transition-colors">{perm}</span>
                                            <input 
                                                type="checkbox" 
                                                checked={groupData.permissions.includes(perm)} 
                                                onChange={() => {
                                                    const next = groupData.permissions.includes(perm) 
                                                        ? groupData.permissions.filter(p => p !== perm) 
                                                        : [...groupData.permissions, perm];
                                                    setGroupData({...groupData, permissions: next});
                                                }}
                                                className="w-7 h-7 rounded-xl border-slate-300 text-primary-600 focus:ring-primary-500 shadow-sm"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSaveGroup} className="w-full mt-12 py-6 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary-500/30 hover:bg-primary-700 active:scale-[0.98] transition-all">Сохранить конфигурацию</button>
                    </div>
                </div>
            )}

            {/* Messaging Modal */}
            {msgModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[120] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl p-12 animate-slide-up border border-white/10">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner">
                                {msgModal.type === 'push' ? <BellIcon className="w-8 h-8" /> : <EnvelopeIcon className="w-8 h-8" />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Рассылка</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Канал: <span className="text-primary-600 font-black">{msgModal.type}</span></p>
                            </div>
                        </div>
                        <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Текст уведомления для сотрудника..." className="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm mb-8 resize-none font-medium focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner" />
                        <div className="flex gap-4">
                            <button onClick={() => setMsgModal(null)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-2xl text-xs uppercase tracking-widest transition-all">Отмена</button>
                            <button onClick={handleSend} className="flex-[2] py-5 bg-primary-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all">Отправить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

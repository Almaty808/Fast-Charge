
import React, { useState, useMemo } from 'react';
import { User, UserStatus, UserRole, Station, StationStatus, AppNotification } from '../types';
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
    BellIcon,
    PlusIcon,
    SearchIcon,
    PhoneIcon,
    WhatsAppIcon
} from './Icons';
import StatusBadge from './StatusBadge';

interface AdminPanelProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    stations: Station[];
    setStations: React.Dispatch<React.SetStateAction<Station[]>>;
    inventoryCount: number;
    setInventoryCount: React.Dispatch<React.SetStateAction<number>>;
    notifications: AppNotification[];
    onEditStation: (station: Station) => void;
    onDeleteStation: (id: string) => void;
    onStatusChange: (id: string, status: StationStatus) => void;
    onAddStation: () => void;
    onBack: () => void;
}

const UserStatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const colors = {
        [UserStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        [UserStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    };
    return <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${colors[status]}`}>{status}</span>;
}

const UserRoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const colors = {
        [UserRole.ADMIN]: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
        [UserRole.USER]: 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300',
    };
    return <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${colors[role]}`}>{role}</span>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    users, setUsers, 
    stations, setStations, 
    inventoryCount, setInventoryCount, 
    notifications,
    onEditStation,
    onDeleteStation,
    onStatusChange,
    onAddStation,
    onBack 
}) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stations' | 'logs' | 'settings'>('dashboard');
    const [stationSearch, setStationSearch] = useState('');

    const stats = useMemo(() => {
        const total = stations.length;
        const installed = stations.filter(s => s.status === StationStatus.INSTALLED).length;
        const maintenance = stations.filter(s => s.status === StationStatus.MAINTENANCE).length;
        const pendingUsers = users.filter(u => u.status === UserStatus.PENDING).length;

        return { total, installed, maintenance, pendingUsers };
    }, [stations, users]);

    const filteredStations = useMemo(() => {
        if (!stationSearch) return stations;
        const q = stationSearch.toLowerCase();
        return stations.filter(s => 
            s.locationName.toLowerCase().includes(q) || 
            s.sid?.toLowerCase().includes(q) || 
            s.did?.toLowerCase().includes(q) ||
            s.address.toLowerCase().includes(q)
        );
    }, [stations, stationSearch]);

    const handleUpdateUser = (id: string, updates: Partial<User>) => {
        setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const handleDeleteUser = (id: string) => {
        if(users.find(u => u.id === id)?.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
            alert('Нельзя удалить последнего администратора.');
            return;
        }
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const formatWhatsAppLink = (phone: string) => {
        const digitsOnly = phone.replace(/\D/g, '');
        return `https://wa.me/${digitsOnly}`;
    };

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Всего станций', value: stats.total, icon: MapPinIcon, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/10' },
                    { label: 'Установлено', value: stats.installed, icon: CheckIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
                    { label: 'На складе', value: inventoryCount, icon: PackageIcon, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
                    { label: 'Обслуживание', value: stats.maintenance, icon: CogIcon, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10' },
                    { label: 'Ожидают аппрува', value: stats.pendingUsers, icon: UsersIcon, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
                    { label: 'Всего сотрудников', value: users.length, icon: UsersIcon, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-700/50' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-all hover:shadow-md">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-primary-500" />
                    Последняя активность
                </h3>
                <div className="space-y-4">
                    {notifications.slice(0, 5).map(notif => (
                        <div key={notif.id} className="flex gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                            <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                                notif.type === 'danger' ? 'bg-red-500' : 
                                notif.type === 'success' ? 'bg-green-500' : 
                                notif.type === 'warning' ? 'bg-yellow-500' : 'bg-primary-500'
                            }`} />
                            <div className="flex-1">
                                <p className="text-sm text-slate-800 dark:text-slate-200">{notif.message}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] text-slate-400 font-medium">от {notif.author}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(notif.timestamp).toLocaleString('ru-RU')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && <p className="text-slate-500 text-center py-4">Лог пуст</p>}
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Имя</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Контакты</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Статус</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Роль</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="text-slate-500 dark:text-slate-400 text-xs">{user.email}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-primary-600 dark:text-primary-400 font-bold">{user.phone}</span>
                                        <a href={`tel:${user.phone}`} title="Позвонить" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"><PhoneIcon className="w-3 h-3" /></a>
                                        <a href={formatWhatsAppLink(user.phone)} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-green-500"><WhatsAppIcon className="w-3 h-3" /></a>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><UserStatusBadge status={user.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><UserRoleBadge role={user.role} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                    {user.status === UserStatus.PENDING && (
                                        <button onClick={() => handleUpdateUser(user.id, { status: UserStatus.APPROVED })} className="text-green-600 hover:text-green-700 dark:text-green-400 font-bold transition-colors">Аппрув</button>
                                    )}
                                    {user.role === UserRole.USER && (
                                        <button onClick={() => handleUpdateUser(user.id, { role: UserRole.ADMIN })} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold transition-colors">В админы</button>
                                    )}
                                    {user.role === UserRole.ADMIN && (
                                        <button 
                                            onClick={() => handleUpdateUser(user.id, { role: UserRole.USER })} 
                                            className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 font-bold disabled:opacity-30" 
                                            disabled={users.filter(u => u.role === UserRole.ADMIN).length <= 1}
                                        >
                                            Снять админа
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 font-bold transition-colors">Удалить</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderStations = () => (
        <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-80">
                    <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Поиск по названию, SID, адресу..." 
                        value={stationSearch}
                        onChange={(e) => setStationSearch(e.target.value)}
                        className="pl-10 w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <button 
                    onClick={onAddStation}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                >
                    <PlusIcon className="w-4 h-4" />
                    Добавить станцию
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Место / SID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Адрес</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Дата уст.</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Статус</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredStations.map(station => (
                                <tr key={station.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{station.locationName}</div>
                                        <div className="text-xs text-slate-500 font-mono">{station.sid || 'без SID'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{station.address}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                        {new Date(station.installationDate).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select 
                                            value={station.status} 
                                            onChange={(e) => onStatusChange(station.id, e.target.value as StationStatus)}
                                            className="text-[10px] font-bold uppercase tracking-wider rounded-md border-transparent bg-slate-100 dark:bg-slate-700 py-1 pl-2 pr-6 focus:ring-primary-500 transition-all cursor-pointer"
                                        >
                                            {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button 
                                            onClick={() => onEditStation(station)} 
                                            className="p-1.5 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                            title="Редактировать"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteStation(station.id)} 
                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Удалить"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderLogs = () => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Системный журнал событий</h3>
                <span className="text-xs text-slate-500">Всего записей: {notifications.length}</span>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/30 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Дата и время</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Событие</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Автор</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Тип</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {[...notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                            <tr key={log.id} className="text-sm">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString('ru-RU')}</td>
                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{log.message}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{log.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`w-3 h-3 rounded-full inline-block ${
                                        log.type === 'danger' ? 'bg-red-500' : 
                                        log.type === 'success' ? 'bg-green-500' : 
                                        log.type === 'warning' ? 'bg-yellow-500' : 'bg-primary-500'
                                    }`} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CogIcon className="w-6 h-6 text-primary-500" />
                Настройки инвентаря
            </h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Количество станций в наличии (на складе)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="number" 
                            value={inventoryCount}
                            onChange={(e) => setInventoryCount(Math.max(0, parseInt(e.target.value) || 0))}
                            className="block w-32 rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-2xl font-bold p-3"
                        />
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => setInventoryCount(prev => prev + 1)}
                                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setInventoryCount(prev => Math.max(0, prev - 1))}
                                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                            >
                                <TrashIcon className="w-4 h-4 text-red-400" />
                            </button>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Это число уменьшается при создании новых станций и увеличивается при их удалении/демонтаже.</p>
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Опасная зона</h4>
                    <button 
                        onClick={() => {
                            if (window.confirm('Это удалит ВСЕ данные о станциях и сбросит систему. Вы уверены?')) {
                                setStations([]);
                                alert('Система сброшена.');
                            }
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm font-bold transition-all border border-red-200 dark:border-red-900/50"
                    >
                        Сбросить все станции
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
            {/* Sidebar like header */}
            <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
                <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-black text-primary-600 dark:text-primary-400 flex items-center gap-2">
                            <span className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <CogIcon className="w-6 h-6" />
                            </span>
                            Admin Panel
                        </h2>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <button 
                            onClick={() => setActiveTab('dashboard')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <ChartIcon className="w-5 h-5" />
                            Дашборд
                        </button>
                        <button 
                            onClick={() => setActiveTab('stations')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stations' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <MapPinIcon className="w-5 h-5" />
                            Станции
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${activeTab === 'users' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <UsersIcon className="w-5 h-5" />
                            Сотрудники
                            {stats.pendingUsers > 0 && (
                                <span className="absolute right-4 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {stats.pendingUsers}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('logs')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <ClockIcon className="w-5 h-5" />
                            Логи событий
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <CogIcon className="w-5 h-5" />
                            Настройки
                        </button>
                    </nav>
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={onBack}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                        >
                            Вернуться к картам
                        </button>
                    </div>
                </aside>

                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto">
                        <header className="mb-10">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                                {activeTab === 'dashboard' ? 'Общий дашборд' : 
                                 activeTab === 'stations' ? 'Управление станциями' :
                                 activeTab === 'users' ? 'Управление доступом' : 
                                 activeTab === 'logs' ? 'История системы' : 'Системные настройки'}
                            </h1>
                            <p className="text-slate-500 mt-2 font-medium">
                                {activeTab === 'dashboard' ? 'Статистика и ключевые показатели эффективности' : 
                                 activeTab === 'stations' ? 'Полный список оборудования и инструментов управления' :
                                 activeTab === 'users' ? 'Список всех сотрудников и ожидающих подтверждения' : 
                                 activeTab === 'logs' ? 'Детальный аудит всех действий пользователей' : 'Конфигурация глобальных параметров приложения'}
                            </p>
                        </header>

                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'stations' && renderStations()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'logs' && renderLogs()}
                        {activeTab === 'settings' && renderSettings()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;

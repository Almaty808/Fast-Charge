
import React, { useState, useMemo } from 'react';
import { User, UserStatus, UserRole, Station, StationStatus, AppNotification, UserGroup, AppPermission } from '../types';
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
    BellIcon,
    EnvelopeIcon,
    HistoryIcon,
    DownloadIcon
} from './Icons';
import StatusBadge from './StatusBadge';

type AdminTab = 'dashboard' | 'users' | 'tasks' | 'stations' | 'groups' | 'logs' | 'settings';

interface AdminMenuItem {
    id: AdminTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: boolean;
}

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
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [stationSearch, setStationSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [msgModal, setMsgModal] = useState<{ userId: string, type: 'push' | 'email' } | null>(null);
    const [msgBody, setMsgBody] = useState('');
    
    // Group Form State
    const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
    const [groupData, setGroupData] = useState({ name: '', description: '', permissions: [] as AppPermission[] });

    const pendingUsers = useMemo(() => users.filter(u => u.status === UserStatus.PENDING), [users]);
    const activeUsers = useMemo(() => users.filter(u => u.status === UserStatus.APPROVED), [users]);

    const stats = useMemo(() => ({
        total: stations.length,
        installed: stations.filter(s => s.status === StationStatus.INSTALLED).length,
        maintenance: stations.filter(s => s.status === StationStatus.MAINTENANCE).length,
        pendingCount: pendingUsers.length
    }), [stations, pendingUsers]);

    const handleApprove = (userId: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: UserStatus.APPROVED } : u));
    };

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

    const menuItems: AdminMenuItem[] = [
        { id: 'dashboard', label: 'Панель управления', icon: ChartIcon },
        { id: 'stations', label: 'Все объекты', icon: MapPinIcon },
        { id: 'tasks', label: 'Задачи команды', icon: CheckIcon },
        { id: 'users', label: 'Сотрудники', icon: UsersIcon, badge: stats.pendingCount > 0 },
        { id: 'groups', label: 'Группы доступа', icon: CogIcon },
        { id: 'logs', label: 'Журнал событий', icon: HistoryIcon },
        { id: 'settings', label: 'Склад и запасы', icon: PackageIcon },
    ];

    const renderDashboard = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Всего объектов', val: stats.total, icon: MapPinIcon, col: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                    { label: 'Установлено', val: stats.installed, icon: CheckIcon, col: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Запас на складе', val: inventoryCount, icon: PackageIcon, col: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Новые заявки', val: stats.pendingCount, icon: UsersIcon, col: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', pulse: stats.pendingCount > 0 },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
                        <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 shadow-sm ${s.pulse ? 'animate-pulse' : ''}`}>
                            <s.icon className={`w-6 h-6 ${s.col}`} />
                        </div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {pendingUsers.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-rose-100 dark:border-rose-900/30 p-8 shadow-xl shadow-rose-500/5">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5 text-rose-500" />
                                    Ожидают подтверждения ({pendingUsers.length})
                                </h3>
                                <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-primary-600 hover:underline">Все сотрудники</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingUsers.map(u => (
                                    <div key={u.id} className="p-4 bg-rose-50/50 dark:bg-rose-950/10 rounded-2xl flex items-center justify-between gap-4 border border-rose-100/50 dark:border-rose-900/20">
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">{u.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleApprove(u.id)}
                                            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/20"
                                        >
                                            Одобрить
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Последние уведомления</h3>
                            <button className="text-xs font-bold text-primary-600 hover:underline">Все события</button>
                        </div>
                        <div className="space-y-6">
                            {notifications.length > 0 ? (
                              notifications.slice(0, 8).map(n => (
                                <div key={n.id} className="flex gap-4 items-start group">
                                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                                        n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                        n.type === 'assignment' ? 'bg-primary-50 text-primary-600' :
                                        n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                                        'bg-slate-50 text-slate-500'
                                    }`}>
                                        {n.type === 'warning' ? <BellIcon className="w-5 h-5" /> : (n.type === 'assignment' ? <MapPinIcon className="w-5 h-5" /> : <BellIcon className="w-5 h-5" />)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-800 dark:text-slate-200 font-bold group-hover:text-primary-600 transition-colors leading-tight">{n.message}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{n.author}</span>
                                            <span className="text-[10px] text-slate-400">• {new Date(n.timestamp).toLocaleString([], {day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                </div>
                              ))
                            ) : (
                              <div className="py-10 text-center text-slate-400">Нет новых событий</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-primary-500/20">
                        <h4 className="text-lg font-black mb-2 tracking-tight">Быстрое действие</h4>
                        <p className="text-sm opacity-80 mb-6 font-medium">Создайте новый объект установки за несколько секунд.</p>
                        <button onClick={onAddStation} className="w-full py-4 bg-white text-primary-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-colors active:scale-95">Добавить станцию</button>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-8 shadow-sm">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Статус системы</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Сервер</span>
                                <span className="flex items-center gap-1.5 text-emerald-600 font-black uppercase tracking-tighter"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> Активен</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">API Gemini</span>
                                <span className="text-emerald-600 font-black uppercase tracking-tighter">Подключено</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Версия</span>
                                <span className="text-slate-400 font-black">2.4.0-web</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => {
        const filteredPending = pendingUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
        const filteredActive = activeUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

        return (
            <div className="space-y-12">
                <div className="relative max-w-md mb-8">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        value={userSearch} 
                        onChange={e => setUserSearch(e.target.value)} 
                        placeholder="Поиск по имени или email..." 
                        className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 rounded-2xl border-none shadow-sm text-sm"
                    />
                </div>

                {filteredPending.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Заявки на регистрацию ({filteredPending.length})</h3>
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredPending.map(u => (
                                <div key={u.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-rose-100 dark:border-rose-900/30 shadow-xl shadow-rose-500/5 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="w-20 h-20 rounded-[1.75rem] bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 font-black text-3xl shrink-0">
                                        {u.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white">{u.name}</h4>
                                        <p className="text-sm text-slate-500 font-medium mb-2">{u.email} • {u.phone}</p>
                                        <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Новый участник</span>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button 
                                            onClick={() => handleApprove(u.id)}
                                            className="flex-1 md:px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                        >
                                            Активировать
                                        </button>
                                        <button 
                                            onClick={() => { if(confirm('Удалить заявку?')) setUsers(us => us.filter(x => x.id !== u.id)) }}
                                            className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"
                                        >
                                            <TrashIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Активный штат ({activeUsers.length})</h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredActive.map(u => (
                            <div key={u.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0">{u.name.charAt(0)}</div>
                                    <div className="min-w-0">
                                        <h4 className="text-base font-black text-slate-900 dark:text-white truncate">{u.name}</h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-[10px] text-primary-600 font-black uppercase tracking-widest">{u.role}</span>
                                            {u.groupId && (
                                                <span className="text-[9px] bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full font-bold text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600">
                                                    {userGroups.find(g => g.id === u.groupId)?.name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium mt-1 truncate">{u.email} • {u.phone}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
                                    <div className="flex gap-2">
                                        <button onClick={() => setMsgModal({ userId: u.id, type: 'push' })} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary-50 text-primary-500 transition-colors" title="Push"><BellIcon className="w-5 h-5" /></button>
                                        <button onClick={() => setMsgModal({ userId: u.id, type: 'email' })} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary-50 text-indigo-500 transition-colors" title="Email"><EnvelopeIcon className="w-5 h-5" /></button>
                                        <button onClick={() => { if(confirm('Удалить сотрудника?')) setUsers(us => us.filter(x => x.id !== u.id)) }} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-100 text-red-500 transition-colors" title="Delete"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                    <select 
                                        value={u.groupId || ''} 
                                        onChange={(e) => setUsers(us => us.map(user => user.id === u.id ? { ...user, groupId: e.target.value } : user))}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-none rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500"
                                    >
                                        <option value="">Без группы</option>
                                        {userGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTasks = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeUsers.map(user => {
                    const userStations = stations.filter(s => s.assignedUserId === user.id);
                    return (
                        <div key={user.id} className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center font-black text-xl shadow-lg">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{user.name}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-primary-600 leading-none">{userStations.length}</div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Задач в работе</p>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-8 space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
                                {userStations.length > 0 ? (
                                    userStations.map(s => (
                                        <div key={s.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-primary-200 transition-all flex items-center justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h5 className="text-sm font-black text-slate-800 dark:text-slate-200 truncate">{s.locationName}</h5>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <StatusBadge status={s.status} />
                                                    <span className="text-[9px] text-slate-400 font-bold truncate">ID: {s.sid}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => onEditStation(s)}
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-600 transition-all"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => onStatusChange(s.id, StationStatus.PLANNED)}
                                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-500 transition-all"
                                                    title="Открепить"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400 italic text-sm font-medium">Нет активных задач</div>
                                )}
                            </div>
                            
                            {userStations.length > 0 && (
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Прогресс установки</span>
                                        <span className="text-[9px] font-black text-emerald-500">
                                            {Math.round((userStations.filter(s => s.status === StationStatus.INSTALLED).length / userStations.length) * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                            style={{ width: `${(userStations.filter(s => s.status === StationStatus.INSTALLED).length / userStations.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderGroups = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Группы доступа</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Управление ролями и разрешениями сотрудников.</p>
                </div>
                <button onClick={() => handleOpenGroupForm()} className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Создать группу
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userGroups.map(group => (
                    <div key={group.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xl font-black text-slate-900 dark:text-white truncate">{group.name}</h4>
                                <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">{group.description}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleOpenGroupForm(group)} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all">
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => { if(confirm('Удалить группу?')) setUserGroups(gs => gs.filter(g => g.id !== group.id)) }} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {group.permissions.map(perm => (
                                <span key={perm} className="px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-600">
                                    {perm}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-['Plus_Jakarta_Sans']">
            
            {/* Sidebar - Desktop Version */}
            <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 fixed h-full z-50">
                <div className="p-8 pb-12 flex items-center gap-3">
                    <div className="bg-primary-600 p-2 rounded-2xl shadow-lg shadow-primary-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge</h1>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Admin Control</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                    {menuItems.map((item: AdminMenuItem) => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id)} 
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative ${
                                activeTab === item.id 
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' 
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500/50" />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 pt-10 mt-auto border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                        Выйти из панели
                    </button>
                </div>
            </aside>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 shrink-0 overflow-x-auto scrollbar-hide pt-safe sticky top-0 z-[60]">
                <div className="flex gap-6 py-4 min-w-max">
                    {menuItems.map((item: AdminMenuItem) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === item.id ? 'text-primary-600 border-b-2 border-primary-600 pb-2' : 'text-slate-400'}`}>
                            <item.icon className="w-4 h-4" /> {item.label.split(' ')[0]}
                            {item.badge && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Viewport */}
            <main className="flex-1 md:ml-72 min-h-screen">
                <div className="max-w-6xl mx-auto p-6 md:p-12 pb-32">
                    
                    <div className="hidden md:flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {menuItems.find(i => i.id === activeTab)?.label}
                            </h2>
                            <p className="text-slate-500 font-medium mt-1">Добро пожаловать в центр управления ресурсами.</p>
                        </div>
                    </div>

                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'stations' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full md:w-96">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input value={stationSearch} onChange={e => setStationSearch(e.target.value)} placeholder="Поиск объектов в реестре..." className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 rounded-2xl border-none shadow-sm text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" />
                                </div>
                                <button onClick={onAddStation} className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                                    <PlusIcon className="w-5 h-5" /> Добавить станцию
                                </button>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {stations.filter(s => s.locationName.toLowerCase().includes(stationSearch.toLowerCase())).map(s => (
                                    <div key={s.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm group hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                                <MapPinIcon className="w-7 h-7 text-primary-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{s.locationName}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{s.status} • {s.address}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => onEditStation(s)} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"><EditIcon className="w-6 h-6" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'tasks' && renderTasks()}
                    {activeTab === 'groups' && renderGroups()}
                    {activeTab === 'logs' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Журнал последних действий</h3>
                                <button className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl text-slate-400"><DownloadIcon className="w-5 h-5" /></button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="px-8 py-5">Сотрудник</th>
                                            <th className="px-8 py-5">Действие</th>
                                            <th className="px-8 py-5">Тип</th>
                                            <th className="px-8 py-5">Время</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {notifications.map(n => (
                                            <tr key={n.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-black text-xs">{n.author.charAt(0)}</div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{n.author}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-sm text-slate-500 font-medium">{n.message}</td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                        n.type === 'assignment' ? 'bg-primary-50 text-primary-600' :
                                                        n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                                        n.type === 'warning' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                                                        'bg-slate-100 text-slate-400'
                                                    }`}>{n.type}</span>
                                                </td>
                                                <td className="px-8 py-6 text-xs text-slate-400 font-medium">
                                                    {new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-12 rounded-[3rem] text-center shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <PackageIcon className="w-10 h-10 text-primary-600" />
                                </div>
                                <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest mb-2">Запасы Fast Charge</h4>
                                <div className="text-8xl font-black text-primary-600 tracking-tighter mb-8">{inventoryCount}</div>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => setInventoryCount(c => Math.max(0, c - 1))} className="w-20 h-20 rounded-[1.5rem] bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center text-3xl font-black shadow-sm active:scale-95 transition-transform">-1</button>
                                    <button onClick={() => setInventoryCount(c => c + 1)} className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center text-3xl font-black shadow-sm active:scale-95 transition-transform">+1</button>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-12 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6">Настройки системы</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Email уведомления</div>
                                        <div className="w-12 h-6 bg-primary-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Автоматический ИИ помощник</div>
                                        <div className="w-12 h-6 bg-primary-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals */}
            {isGroupFormOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{editingGroup ? 'Редактирование' : 'Новая группа'}</h3>
                            <button onClick={() => setIsGroupFormOpen(false)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 transition-colors">✕</button>
                        </div>
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Название</label>
                                <input value={groupData.name} onChange={e => setGroupData({...groupData, name: e.target.value})} placeholder="Напр. Отдел Монтажа" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Описание полномочий</label>
                                <textarea value={groupData.description} onChange={e => setGroupData({...groupData, description: e.target.value})} placeholder="Какие задачи решает группа..." className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm h-28 resize-none focus:ring-4 focus:ring-primary-500/10 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Разрешения (Permissions)</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {Object.values(AppPermission).map(perm => (
                                        <label key={perm} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl cursor-pointer hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-100 transition-all">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{perm}</span>
                                            <input 
                                                type="checkbox" 
                                                checked={groupData.permissions.includes(perm)} 
                                                onChange={() => {
                                                    const next = groupData.permissions.includes(perm) 
                                                        ? groupData.permissions.filter(p => p !== perm) 
                                                        : [...groupData.permissions, perm];
                                                    setGroupData({...groupData, permissions: next});
                                                }}
                                                className="w-6 h-6 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSaveGroup} className="w-full mt-10 py-5 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-[0.98] transition-all">Сохранить изменения</button>
                    </div>
                </div>
            )}

            {msgModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[120] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-[2.5rem] shadow-2xl p-10 animate-slide-up">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                                {msgModal.type === 'push' ? <BellIcon className="w-6 h-6" /> : <EnvelopeIcon className="w-6 h-6" />}
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Сообщение</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mb-6">Тип уведомления: <span className="text-primary-600 font-bold uppercase">{msgModal.type}</span></p>
                        <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} placeholder="Напишите сообщение сотруднику..." className="w-full h-40 p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm mb-6 resize-none focus:ring-4 focus:ring-primary-500/10 transition-all" />
                        <div className="flex gap-3">
                            <button onClick={() => setMsgModal(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm">Отмена</button>
                            <button onClick={handleSend} className="flex-[2] py-4 bg-primary-600 text-white font-black rounded-xl text-sm shadow-lg shadow-primary-500/30">Отправить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

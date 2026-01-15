
import React, { useState, useMemo, useEffect } from 'react';
import { User, UserStatus, UserRole, Station, StationStatus, AppNotification, UserGroup, AppPermission, InventoryItem, StockLog } from '../types';
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
    DownloadIcon,
    ChevronDownIcon,
    SparklesIcon,
    BoltIcon,
    ShieldCheckIcon
} from './Icons';
import StatusBadge from './StatusBadge';
import { analyzeInventory } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';

type AdminTab = 'dashboard' | 'users' | 'tasks' | 'stations' | 'groups' | 'logs' | 'inventory';

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
    const [userSearch, setUserSearch] = useState('');
    
    // User Management State
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userData, setUserData] = useState({ loginId: '', name: '', email: '', phone: '', password: '', role: UserRole.INSTALLER, groupId: '' });

    // Inventory State
    const [inventoryItems, setInventoryItems] = useLocalStorage<InventoryItem[]>('app_inventory_items', [
        { id: 'inv-1', name: 'Зарядные станции v2.5', category: 'hardware', quantity: 45, minThreshold: 10, unit: 'шт', lastUpdated: new Date().toISOString() },
        { id: 'inv-2', name: 'Кабели Lightning MFi', category: 'cables', quantity: 120, minThreshold: 30, unit: 'шт', lastUpdated: new Date().toISOString() },
        { id: 'inv-3', name: 'Кабели Type-C 20W', category: 'cables', quantity: 85, minThreshold: 25, unit: 'шт', lastUpdated: new Date().toISOString() },
        { id: 'inv-4', name: 'SIM-карты (M2M)', category: 'sim', quantity: 32, minThreshold: 15, unit: 'шт', lastUpdated: new Date().toISOString() },
        { id: 'inv-5', name: 'Брендированные наклейки', category: 'marketing', quantity: 200, minThreshold: 50, unit: 'уп', lastUpdated: new Date().toISOString() },
    ]);
    const [stockLogs, setStockLogs] = useLocalStorage<StockLog[]>('app_stock_logs', []);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        onSendMessage('Ваш аккаунт подтвержден! Добро пожаловать в команду.', 'success', userId);
    };

    const handleUpdateStock = (itemId: string, amount: number) => {
        setInventoryItems(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = Math.max(0, item.quantity + amount);
                const log: StockLog = {
                    id: 'log-' + Date.now(),
                    itemId: item.id,
                    itemName: item.name,
                    change: amount,
                    author: 'Администратор',
                    timestamp: new Date().toISOString()
                };
                setStockLogs([log, ...stockLogs.slice(0, 49)]);
                if (item.category === 'hardware') setInventoryCount(newQty);
                return { ...item, quantity: newQty, lastUpdated: new Date().toISOString() };
            }
            return item;
        }));
    };

    const handleAiAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeInventory(inventoryItems);
            setAiAnalysis(result);
        } catch (e) {
            setAiAnalysis("Ошибка анализа.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // User CRUD logic
    const handleOpenUserModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setUserData({ 
                loginId: user.loginId,
                name: user.name, 
                email: user.email, 
                phone: user.phone, 
                password: user.password, 
                role: user.role, 
                groupId: user.groupId || '' 
            });
        } else {
            setEditingUser(null);
            setUserData({ 
                loginId: 'FC-' + (users.length + 100),
                name: '', 
                email: '', 
                phone: '', 
                password: '', 
                role: UserRole.INSTALLER, 
                groupId: '' 
            });
        }
        setIsAddUserModalOpen(true);
    };

    const handleSaveUser = () => {
        const normalizedLoginId = userData.loginId.toLowerCase().trim();

        if (!normalizedLoginId || !userData.name || !userData.password) {
            alert('Заполните обязательные поля: ID, Имя и Пароль');
            return;
        }

        if (editingUser) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { 
                ...u, 
                ...userData, 
                loginId: normalizedLoginId,
                status: UserStatus.APPROVED
            } : u));
            onSendMessage(`Ваш профиль обновлен. Ваш ID для входа: ${normalizedLoginId}`, 'info', editingUser.id);
        } else {
            if (users.some(u => u.loginId.toLowerCase().trim() === normalizedLoginId)) {
                alert('Пользователь с таким ID уже существует!');
                return;
            }

            const newUser: User = {
                id: 'u-' + Date.now(),
                ...userData,
                loginId: normalizedLoginId,
                status: UserStatus.APPROVED
            };
            setUsers(prev => [...prev, newUser]);
        }
        setIsAddUserModalOpen(false);
    };

    const menuItems: AdminMenuItem[] = [
        { id: 'dashboard', label: 'Панель управления', icon: ChartIcon },
        { id: 'stations', label: 'Все объекты', icon: MapPinIcon },
        { id: 'users', label: 'Сотрудники', icon: UsersIcon, badge: stats.pendingCount > 0 },
        { id: 'inventory', label: 'Склад и запасы', icon: PackageIcon },
        { id: 'logs', label: 'Журнал событий', icon: HistoryIcon },
    ];

    const renderUsers = () => {
        const filteredPending = pendingUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.loginId.toLowerCase().includes(userSearch.toLowerCase()));
        const filteredActive = activeUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.loginId.toLowerCase().includes(userSearch.toLowerCase()));

        return (
            <div className="space-y-12">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full lg:w-96">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Поиск по ФИО или ID..." className="w-full pl-12 pr-6 py-5 bg-white dark:bg-slate-800 rounded-3xl border-none shadow-sm text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" />
                    </div>
                    <button onClick={() => handleOpenUserModal()} className="w-full lg:w-auto px-10 py-5 bg-primary-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-3 active:scale-95">
                        <PlusIcon className="w-5 h-5" /> Создать новый аккаунт
                    </button>
                </div>

                {filteredPending.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight ml-2 flex items-center gap-3">
                            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse" />
                            Новые заявки ({filteredPending.length})
                        </h3>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {filteredPending.map(u => (
                                <div key={u.id} className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-rose-100 dark:border-rose-900/30 shadow-xl flex flex-col md:flex-row gap-6 items-center animate-scale-in">
                                    <div className="w-20 h-20 rounded-[1.75rem] bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 font-black text-3xl shrink-0">{u.name.charAt(0)}</div>
                                    <div className="flex-1 text-center md:text-left min-w-0">
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white truncate">{u.name}</h4>
                                        <p className="text-sm text-slate-500 font-medium mb-1">ID (временный): {u.loginId}</p>
                                        <p className="text-xs text-slate-400 font-medium truncate">{u.email}</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button onClick={() => handleApprove(u.id)} className="flex-1 md:px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Одобрить</button>
                                        <button onClick={() => { if(confirm('Удалить?')) setUsers(prev => prev.filter(p => p.id !== u.id)) }} className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><TrashIcon className="w-6 h-6" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight ml-2">Список сотрудников ({activeUsers.length})</h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredActive.map(u => (
                            <div key={u.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0 ${u.role === UserRole.ADMIN ? 'bg-gradient-to-br from-rose-500 to-rose-700' : 'bg-gradient-to-br from-primary-500 to-indigo-600'}`}>{u.name.charAt(0)}</div>
                                    <div className="min-w-0">
                                        <h4 className="text-base font-black text-slate-900 dark:text-white truncate">{u.name}</h4>
                                        <p className="text-sm font-black text-primary-600 uppercase tracking-widest">ID: {u.loginId}</p>
                                        <p className="text-xs text-slate-400 font-medium truncate mt-1">{u.role} • {u.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => handleOpenUserModal(u)} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl text-primary-500 hover:bg-primary-50 transition-colors"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => { if(confirm('Удалить сотрудника?')) setUsers(us => us.filter(x => x.id !== u.id)) }} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-500 hover:bg-red-100 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-['Plus_Jakarta_Sans']">
            <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 fixed h-full z-50">
                <div className="p-8 pb-12 flex items-center gap-3"><div className="bg-primary-600 p-2 rounded-2xl shadow-lg shadow-primary-500/20"><svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div><div><h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge</h1><p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Admin Control</p></div></div>
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
                    {menuItems.map((item: AdminMenuItem) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative ${activeTab === item.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}><item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} /><span className="flex-1 text-left">{item.label}</span>{item.badge && <span className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500/50" />}</button>
                    ))}
                </nav>
                <div className="p-6 pt-10 mt-auto border-t border-slate-100 dark:border-slate-800"><button onClick={onBack} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Выйти из панели</button></div>
            </aside>
            <main className="flex-1 md:ml-72 min-h-screen">
                <div className="max-w-6xl mx-auto p-6 md:p-12 pb-32">
                    {activeTab === 'dashboard' && <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Всего объектов', val: stats.total, icon: MapPinIcon, col: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                                { label: 'Установлено', val: stats.installed, icon: CheckIcon, col: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                { label: 'Запас на складе', val: inventoryCount, icon: PackageIcon, col: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                { label: 'Новые заявки', val: stats.pendingCount, icon: UsersIcon, col: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', pulse: stats.pendingCount > 0 },
                            ].map((s, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
                                    <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 shadow-sm ${s.pulse ? 'animate-pulse' : ''}`}><s.icon className={`w-6 h-6 ${s.col}`} /></div>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{s.val}</p>
                                </div>
                            ))}
                        </div>
                    </div>}
                    {activeTab === 'inventory' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-gradient-to-br from-indigo-600 to-primary-700 rounded-[2.5rem] p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-10 opacity-10"><SparklesIcon className="w-32 h-32" /></div>
                                <div className="relative z-10 max-w-xl">
                                    <h3 className="text-3xl font-black mb-3 flex items-center gap-3"><SparklesIcon className="w-8 h-8" />AI Складской Прогноз</h3>
                                    <p className="text-indigo-100 font-medium leading-relaxed italic">{aiAnalysis || "Нажмите для анализа остатков."}</p>
                                </div>
                                <button onClick={handleAiAnalysis} disabled={isAnalyzing} className="relative z-10 px-8 py-4 bg-white text-primary-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95">{isAnalyzing ? 'Анализ...' : 'Запустить ИИ'}</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {inventoryItems.map(item => (
                                    <div key={item.id} className={`bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 transition-all shadow-sm ${item.quantity <= item.minThreshold ? 'border-rose-500/30 shadow-rose-500/5' : 'border-slate-100 dark:border-slate-800'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center"><PackageIcon className="w-6 h-6" /></div>
                                            <div className="text-right"><p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{item.quantity}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.unit}</p></div>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">{item.name}</h4>
                                        <div className="grid grid-cols-2 gap-3 mt-8">
                                            <button onClick={() => handleUpdateStock(item.id, -1)} className="py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 font-black hover:bg-rose-50 hover:text-rose-600 transition-all">-1</button>
                                            <button onClick={() => handleUpdateStock(item.id, 1)} className="py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 font-black hover:bg-emerald-50 hover:text-emerald-600 transition-all">+1</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && renderUsers()}
                </div>
            </main>

            {/* Manual User Creation Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[150] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in border border-white/5">
                        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div><h3 className="text-2xl font-black text-slate-900 dark:text-white">{editingUser ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Создайте ID и пароль для входа</p></div>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500">✕</button>
                        </div>
                        <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ID для входа <span className="text-rose-500">*</span></label>
                                    <input value={userData.loginId} onChange={e => setUserData({...userData, loginId: e.target.value.toUpperCase()})} placeholder="FC-101" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-black text-primary-600 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">Сотрудник будет использовать этот код вместо Email</p>
                                </div>
                                <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ФИО <span className="text-rose-500">*</span></label><input value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} placeholder="Александр Петров" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" /></div>
                                <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Пароль <span className="text-rose-500">*</span></label><input type="text" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} placeholder="Введите пароль" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" /></div>
                                <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label><input type="email" value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} placeholder="petrov@mail.com" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" /></div>
                                <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Телефон</label><input type="tel" value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} placeholder="+7 777..." className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm focus:ring-4 focus:ring-primary-500/10 transition-all" /></div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Роль</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[UserRole.INSTALLER, UserRole.MANAGER, UserRole.USER, UserRole.ADMIN].map(role => (
                                        <button key={role} onClick={() => setUserData({...userData, role})} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${userData.role === role ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800'}`}>{role}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-10 border-t border-slate-100 dark:border-slate-800"><button onClick={handleSaveUser} className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-[0.98] transition-all">{editingUser ? 'Сохранить изменения' : 'Создать и активировать аккаунт'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

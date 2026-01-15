
import React, { useState, useMemo } from 'react';
import { User, UserStatus, UserRole, Station, StationStatus, AppNotification, UserGroup, InventoryItem, StockLog, InventoryStatus } from '../types';
import { 
    UsersIcon, 
    ChartIcon, 
    CogIcon, 
    PackageIcon, 
    MapPinIcon, 
    TrashIcon, 
    EditIcon, 
    PlusIcon,
    SearchIcon,
    HistoryIcon
} from './Icons';
import useLocalStorage from '../hooks/useLocalStorage';

type AdminTab = 'dashboard' | 'users' | 'stations' | 'inventory' | 'logs';

// Updated AdminPanelProps to include missing fields required by App.tsx
interface AdminPanelProps {
    users: User[];
    setUsers: (value: User[] | ((val: User[]) => User[])) => void;
    stations: Station[];
    setStations: (value: Station[] | ((val: Station[]) => Station[])) => void;
    userGroups: UserGroup[];
    setUserGroups: (value: UserGroup[] | ((val: UserGroup[]) => UserGroup[])) => void;
    inventoryCount: number;
    setInventoryCount: (value: number | ((val: number) => number)) => void;
    notifications: AppNotification[];
    onEditStation: (station: Station) => void;
    onDeleteStation: (id: string) => void;
    onStatusChange: (id: string, status: StationStatus) => void;
    onAddStation: () => void;
    onBack: () => void;
    onSendMessage: (message: string, type: AppNotification['type'], userId?: string) => void;
}

// Added missing destructured props to the component definition
const AdminPanel: React.FC<AdminPanelProps> = ({ 
    users, setUsers, stations, setStations, 
    userGroups, setUserGroups,
    inventoryCount, setInventoryCount, 
    notifications,
    onEditStation, onDeleteStation, onStatusChange, 
    onAddStation,
    onBack,
    onSendMessage
}) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('users');
    const [userSearch, setUserSearch] = useState('');
    
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userData, setUserData] = useState({ loginId: '', name: '', email: '', phone: '', password: '', role: UserRole.INSTALLER });

    const handleOpenUserModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setUserData({ 
                loginId: user.loginId || '',
                name: user.name, 
                email: user.email, 
                phone: user.phone, 
                password: user.password, 
                role: user.role
            });
        } else {
            setEditingUser(null);
            setUserData({ 
                loginId: 'ALIM-',
                name: '', 
                email: '', 
                phone: '', 
                password: '', 
                role: UserRole.INSTALLER
            });
        }
        setIsAddUserModalOpen(true);
    };

    const handleSaveUser = () => {
        const cleanLoginId = userData.loginId.trim();
        const cleanName = userData.name.trim();

        if (!cleanLoginId || !cleanName || !userData.password) {
            alert('ЗАПОЛНИТЕ ВСЕ ОБЯЗАТЕЛЬНЫЕ ПОЛЯ (ID, ИМЯ, ПАРОЛЬ)');
            return;
        }

        if (editingUser) {
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { 
                ...u, 
                ...userData, 
                loginId: cleanLoginId,
                name: cleanName,
                status: UserStatus.APPROVED // Принудительно подтвержден
            } : u));
        } else {
            const exists = users.some(u => (u.loginId || '').replace(/\s+/g, '').toLowerCase() === cleanLoginId.replace(/\s+/g, '').toLowerCase());
            if (exists) {
                alert('СОТРУДНИК С ТАКИМ ID УЖЕ СУЩЕСТВУЕТ В СИСТЕМЕ!');
                return;
            }

            const newUser: User = { 
                id: 'u-' + Date.now(), 
                ...userData, 
                loginId: cleanLoginId, 
                name: cleanName,
                status: UserStatus.APPROVED // Все аккаунты от админа сразу активны
            };
            setUsers(prev => [...prev, newUser]);
        }
        setIsAddUserModalOpen(false);
    };

    const pendingUsers = useMemo(() => users.filter(u => u.status === UserStatus.PENDING), [users]);
    const activeUsers = useMemo(() => users.filter(u => u.status === UserStatus.APPROVED), [users]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-['Plus_Jakarta_Sans']">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 fixed h-full z-50">
                <div className="p-8 pb-12">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Panel</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <UsersIcon className="w-5 h-5" /> Сотрудники
                    </button>
                    <button onClick={() => setActiveTab('stations')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'stations' ? 'bg-primary-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <MapPinIcon className="w-5 h-5" /> Объекты
                    </button>
                </nav>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest">Вернуться</button>
                </div>
            </aside>

            {/* Content */}
            <main className="flex-1 md:ml-72 min-h-screen p-6 md:p-12">
                {activeTab === 'users' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Управление персоналом</h2>
                            <button onClick={() => handleOpenUserModal()} className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-primary-700 active:scale-95 transition-all flex items-center gap-3">
                                <PlusIcon className="w-5 h-5" /> Добавить сотрудника
                            </button>
                        </div>

                        {pendingUsers.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest ml-2">Ожидают активации ({pendingUsers.length})</h3>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {pendingUsers.map(u => (
                                        <div key={u.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border-2 border-rose-100 flex items-center gap-6 shadow-sm">
                                            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xl">{u.name.charAt(0)}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-900 dark:text-white truncate">{u.name}</h4>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">ID: {u.loginId}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setUsers(prev => prev.map(x => x.id === u.id ? {...x, status: UserStatus.APPROVED} : x))} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Активировать</button>
                                                <button onClick={() => setUsers(prev => prev.filter(x => x.id !== u.id))} className="p-2 text-rose-500"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Активные сотрудники ({activeUsers.length})</h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {activeUsers.map(u => (
                                    <div key={u.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-6 shadow-sm">
                                        <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xl shadow-lg">{u.name.charAt(0)}</div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{u.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-100">
                                                    ID: {u.loginId}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{u.role}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleOpenUserModal(u)} className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary-600 rounded-xl transition-all"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => { if(confirm('Удалить?')) setUsers(prev => prev.filter(x => x.id !== u.id)) }} className="p-3 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-xl transition-all"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 animate-scale-in">
                        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingUser ? 'Изменить сотрудника' : 'Новый сотрудник'}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Аккаунт будет активирован мгновенно</p>
                            </div>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500">✕</button>
                        </div>
                        <div className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">USER ID (ДЛЯ ВХОДА) <span className="text-rose-500">*</span></label>
                                    <input value={userData.loginId} onChange={e => setUserData({...userData, loginId: e.target.value})} placeholder="Напр. ALIM-102" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-primary-500 outline-none font-black text-primary-600 tracking-widest" />
                                </div>
                                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ФИО <span className="text-rose-500">*</span></label><input value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} placeholder="Алимов Алишер" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm outline-none" /></div>
                                <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">ПАРОЛЬ <span className="text-rose-500">*</span></label><input type="text" value={userData.password} onChange={e => setUserData({...userData, password: e.target.value})} placeholder="Придумайте пароль" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm outline-none" /></div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Роль доступа</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[UserRole.INSTALLER, UserRole.MANAGER, UserRole.USER, UserRole.ADMIN].map(role => (
                                        <button key={role} onClick={() => setUserData({...userData, role})} className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${userData.role === role ? 'bg-primary-600 text-white border-primary-600 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'}`}>{role}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-10 border-t border-slate-100 dark:border-slate-800">
                            <button onClick={handleSaveUser} className="w-full py-5 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-primary-700 active:scale-95 transition-all">
                                {editingUser ? 'Обновить данные' : 'Создать и активировать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;

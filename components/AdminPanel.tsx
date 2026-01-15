
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
    PlusIcon,
    SearchIcon,
    PhoneIcon,
    WhatsAppIcon,
    BellIcon,
    EnvelopeIcon
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
    onSendMessage: (msg: string, type: AppNotification['type'], userId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    users, setUsers, stations, setStations, inventoryCount, setInventoryCount, notifications,
    onEditStation, onDeleteStation, onStatusChange, onAddStation, onBack, onSendMessage
}) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'stations' | 'logs' | 'settings'>('dashboard');
    const [stationSearch, setStationSearch] = useState('');
    const [msgModal, setMsgModal] = useState<{ userId: string, type: 'push' | 'email' } | null>(null);
    const [msgBody, setMsgBody] = useState('');

    const stats = useMemo(() => ({
        total: stations.length,
        installed: stations.filter(s => s.status === StationStatus.INSTALLED).length,
        maintenance: stations.filter(s => s.status === StationStatus.MAINTENANCE).length,
        pendingUsers: users.filter(u => u.status === UserStatus.PENDING).length
    }), [stations, users]);

    const handleSend = () => {
        if (!msgBody || !msgModal) return;
        onSendMessage(msgBody, msgModal.type === 'push' ? 'push' : 'email', msgModal.userId);
        alert(`${msgModal.type === 'push' ? 'Push-уведомление' : 'Email'} успешно отправлено!`);
        setMsgModal(null);
        setMsgBody('');
    };

    const renderDashboard = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {[
                    { label: 'Всего', val: stats.total, icon: MapPinIcon, col: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                    { label: 'Готово', val: stats.installed, icon: CheckIcon, col: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
                    { label: 'Склад', val: inventoryCount, icon: PackageIcon, col: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    { label: 'Ожидают', val: stats.pendingUsers, icon: UsersIcon, col: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                ].map((s, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className={`w-10 h-10 rounded-2xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.col}`} /></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{s.val}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">События системы</h3>
                <div className="space-y-4">
                    {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                            <div>
                                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{n.message}</p>
                                <p className="text-[10px] text-slate-400 mt-1">{n.author} • {new Date(n.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-3">
            {users.map(u => (
                <div key={u.id} className="bg-white dark:bg-slate-800 p-5 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-black text-lg">{u.name.charAt(0)}</div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">{u.name}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{u.role}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${u.status === UserStatus.APPROVED ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{u.status}</span>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                        <button 
                            onClick={() => setMsgModal({ userId: u.id, type: 'push' })} 
                            className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-primary-50 transition-colors"
                        >
                            <BellIcon className="w-5 h-5 text-primary-500 mb-1" />
                            <span className="text-[9px] font-bold uppercase text-slate-400">Push</span>
                        </button>
                        <button 
                            onClick={() => setMsgModal({ userId: u.id, type: 'email' })} 
                            className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-primary-50 transition-colors"
                        >
                            <EnvelopeIcon className="w-5 h-5 text-indigo-500 mb-1" />
                            <span className="text-[9px] font-bold uppercase text-slate-400">Email</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl hover:bg-slate-100 transition-colors">
                            <EditIcon className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-[9px] font-bold uppercase text-slate-400">Правка</span>
                        </button>
                        <button 
                            onClick={() => { if(confirm('Удалить сотрудника?')) setUsers(us => us.filter(x => x.id !== u.id)) }} 
                            className="flex flex-col items-center justify-center p-3 bg-red-50 dark:bg-red-900/10 rounded-2xl hover:bg-red-100 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5 text-red-500 mb-1" />
                            <span className="text-[9px] font-bold uppercase text-red-400">Del</span>
                        </button>
                    </div>

                    {u.status === UserStatus.PENDING && (
                        <button onClick={() => setUsers(us => us.map(x => x.id === u.id ? {...x, status: UserStatus.APPROVED} : x))} className="w-full mt-3 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Подтвердить доступ</button>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-safe">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 shrink-0 overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 py-4 min-w-max">
                    {[
                        { id: 'dashboard', label: 'Обзор', icon: ChartIcon },
                        { id: 'stations', label: 'Станции', icon: MapPinIcon },
                        { id: 'users', label: 'Люди', icon: UsersIcon },
                        { id: 'settings', label: 'Склад', icon: PackageIcon },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'text-primary-600 border-b-2 border-primary-600 pb-1' : 'text-slate-400'}`}>
                            <item.icon className="w-4 h-4" />
                            {item.label}
                            {item.id === 'users' && stats.pendingUsers > 0 && <span className="w-2 h-2 bg-yellow-500 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto pb-24">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'stations' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input value={stationSearch} onChange={e => setStationSearch(e.target.value)} placeholder="Поиск объектов..." className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border-none shadow-sm text-sm" />
                            </div>
                            <div className="space-y-3">
                                {stations.filter(s => s.locationName.toLowerCase().includes(stationSearch.toLowerCase())).map(s => (
                                    <div key={s.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <div>
                                            <h4 className="text-sm font-black truncate">{s.locationName}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.status}</p>
                                        </div>
                                        <button onClick={() => onEditStation(s)} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl text-primary-600"><EditIcon className="w-5 h-5" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'settings' && (
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-4xl text-center space-y-4 shadow-sm">
                             <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Остаток на складе</h4>
                             <div className="text-6xl font-black text-primary-600 tracking-tighter">{inventoryCount}</div>
                             <div className="flex gap-3 justify-center pt-4">
                                <button onClick={() => setInventoryCount(c => Math.max(0, c - 1))} className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-black shadow-sm">-1</button>
                                <button onClick={() => setInventoryCount(c => c + 1)} className="w-16 h-16 rounded-3xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-black shadow-sm">+1</button>
                             </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Message Modal */}
            {msgModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-4xl shadow-2xl p-6 animate-slide-up">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Отправить {msgModal.type}</h3>
                        <p className="text-xs text-slate-500 mb-4">Пользователю будет выслано сообщение</p>
                        <textarea 
                            value={msgBody} 
                            onChange={e => setMsgBody(e.target.value)}
                            placeholder="Введите текст сообщения..." 
                            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm mb-4 resize-none"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setMsgModal(null)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm">Отмена</button>
                            <button onClick={handleSend} className="flex-2 py-3 bg-primary-600 text-white font-bold rounded-xl text-sm shadow-lg">Отправить</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 md:hidden pb-safe shrink-0">
                <button onClick={onBack} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black rounded-3xl text-xs uppercase tracking-widest">Вернуться к списку</button>
            </div>
        </div>
    );
};

export default AdminPanel;

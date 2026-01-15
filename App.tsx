
import React, { useState, useMemo, useEffect } from 'react';
import { Station, StationStatus, HistoryEntry, User, UserStatus, UserRole, AppNotification, UserGroup, AppPermission } from './types';
import StationList from './components/StationList';
import StationForm from './components/StationForm';
import { PlusIcon, SearchIcon, UsersIcon, LogoutIcon, BellIcon, MapPinIcon, CogIcon, ChartPieIcon, PhoneIcon, ClockIcon } from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import NotificationCenter from './components/NotificationCenter';
import NetworkSummary from './components/NetworkSummary';

const INITIAL_STATIONS: Station[] = [
  {
    id: '1',
    locationName: 'Sky Bar Almaty',
    address: 'пр. Аль-Фараби, 77/7, Алматы',
    installer: 'Главный Администратор',
    installationDate: '2024-08-20',
    status: StationStatus.INSTALLED,
    notes: 'Премиальный объект. Требуется проверка кабелей раз в две недели.',
    history: [{ id: 'h1', date: '2024-08-20T10:00:00Z', employee: 'Система', change: 'Объект интегрирован в сеть' }],
    coordinates: { lat: 43.2389, lng: 76.9455 },
    sid: 'ALM-SKY-01',
    freeUsers: [{ id: 'fu1', fullName: 'Айбек Оспанов', position: 'Менеджер', phone: '+7 707 123 4567' }],
    assignedUserId: 'master-001'
  }
];

const DEFAULT_GROUPS: UserGroup[] = [
  { id: 'g-admin', name: 'Management', description: 'Полный доступ ко всей сети', permissions: Object.values(AppPermission) },
  { id: 'g-installer', name: 'Field Service', description: 'Установка и обслуживание объектов', permissions: [AppPermission.MANAGE_STATIONS, AppPermission.VIEW_STATS] }
];

type AppView = 'app' | 'admin' | 'stats' | 'team';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: boolean;
}

const App: React.FC = () => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', INITIAL_STATIONS);
  const [users, setUsers] = useLocalStorage<User[]>('auth_users', []);
  const [userGroups, setUserGroups] = useLocalStorage<UserGroup[]>('auth_groups', DEFAULT_GROUPS);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('auth_currentUser', null);
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('app_notifications', []);
  const [inventoryCount, setInventoryCount] = useLocalStorage<number>('app_inventory', 45);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [filterStatus, setFilterStatus] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<AppView>('app');

  const pendingUsersCount = useMemo(() => users.filter(u => u.status === UserStatus.PENDING).length, [users]);
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    const masterEmail = 'almaty808@gmail.com';
    if (!users.find(u => u.email === masterEmail)) {
      const master: User = {
        id: 'master-001',
        name: 'Главный Администратор',
        email: masterEmail,
        phone: '+7 777 808 8888',
        password: '1qazaq1',
        status: UserStatus.APPROVED,
        role: UserRole.ADMIN,
        groupId: 'g-admin'
      };
      setUsers([master, ...users]);
    }
  }, [users, setUsers]);

  const createNotification = (message: string, type: AppNotification['type'] = 'info', targetUserId?: string) => {
    const newNotif: AppNotification = {
        id: 'n-' + Date.now(),
        message,
        timestamp: new Date().toISOString(),
        author: currentUser?.name || 'Система',
        read: false,
        type,
        targetUserId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    createNotification(`Новая заявка на доступ: ${newUser.name}`, 'warning');
  };

  const handleSaveStation = (stationToSave: Station) => {
    const existingStation = stations.find(s => s.id === stationToSave.id);
    const isNew = !existingStation;
    
    if (stationToSave.assignedUserId && (!existingStation || existingStation.assignedUserId !== stationToSave.assignedUserId)) {
        createNotification(
            `Вы назначены ответственным за объект: ${stationToSave.locationName}`,
            'assignment',
            stationToSave.assignedUserId
        );
    }

    const historyEntry: HistoryEntry = {
        id: 'h-' + Date.now(),
        date: new Date().toISOString(),
        employee: currentUser?.name || 'Система',
        change: isNew ? 'Создание объекта' : 'Обновление данных'
    };

    const updated = { ...stationToSave, history: [...(stationToSave.history || []), historyEntry] };

    if (isNew) {
        setStations([updated, ...stations]);
        createNotification(`Добавлен новый объект: ${stationToSave.locationName}`, 'success');
    } else {
        setStations(stations.map(s => s.id === stationToSave.id ? updated : s));
    }
    setIsFormOpen(false);
    setEditingStation(null);
  };

  const displayedStations = useMemo(() => {
    let result = filterStatus === 'Все' ? stations : stations.filter(s => s.status === filterStatus);
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(s => s.locationName.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));
    }
    return result;
  }, [stations, filterStatus, searchQuery]);

  const userNotifications = useMemo(() => {
      return notifications.filter(n => !n.targetUserId || n.targetUserId === currentUser?.id || isAdmin);
  }, [notifications, currentUser, isAdmin]);

  const navItems: NavItem[] = [
    { id: 'app', label: 'Объекты', icon: MapPinIcon },
    { id: 'stats', label: 'Аналитика', icon: ChartPieIcon },
    { id: 'team', label: 'Команда', icon: UsersIcon },
    ...(isAdmin ? [{ id: 'admin' as AppView, label: 'Админ', icon: CogIcon, badge: pendingUsersCount > 0 }] : [])
  ];

  const renderMainContent = () => {
    if (!currentUser) return null;

    switch (view) {
      case 'admin':
        return isAdmin ? (
          <AdminPanel 
            users={users} setUsers={setUsers} stations={stations} setStations={setStations}
            userGroups={userGroups} setUserGroups={setUserGroups}
            inventoryCount={inventoryCount} setInventoryCount={setInventoryCount} notifications={notifications}
            onEditStation={(s) => { setEditingStation(s); setIsFormOpen(true); }}
            onDeleteStation={(id) => { if(confirm('Удалить объект?')) setStations(stations.filter(s => s.id !== id)); }}
            onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))}
            onAddStation={() => { setEditingStation(null); setIsFormOpen(true); }}
            onBack={() => setView('app')}
            onSendMessage={(msg, type, userId) => createNotification(msg, type, userId)}
          />
        ) : (
          <main className="container mx-auto px-4 lg:px-12 py-12">
            <StationList stations={displayedStations} selectedStations={new Set()} allUsers={users} onEdit={(s) => { setEditingStation(s); setIsFormOpen(true); }} onDelete={(id) => { if(confirm('Удалить объект?')) setStations(stations.filter(s => s.id !== id)); }} onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))} onToggleSelection={() => {}} />
          </main>
        );

      case 'stats':
        return (
          <main className="container mx-auto px-4 lg:px-12 py-12">
            <NetworkSummary stations={stations} allUsers={users} isAdmin={isAdmin} onEdit={(s) => { setEditingStation(s); setIsFormOpen(true); }} onDelete={(id) => { if(confirm('Удалить объект?')) setStations(stations.filter(s => s.id !== id)); }} onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))} />
          </main>
        );

      case 'team':
        return (
          <main className="container mx-auto px-4 lg:px-12 py-12 animate-slide-up">
              <div className="mb-12 flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl">
                      <UsersIcon className="w-8 h-8" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Команда Fast Charge</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.filter(u => u.status === UserStatus.APPROVED).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center gap-6">
                              <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-primary-500 to-indigo-700 flex items-center justify-center text-white font-black text-2xl">{user.name.charAt(0)}</div>
                              <div>
                                  <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none mb-2">{user.name}</h4>
                                  <span className="text-[9px] font-black uppercase text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">{user.role}</span>
                              </div>
                          </div>
                          <a href={`tel:${user.phone}`} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary-600 border border-slate-100 dark:border-slate-700 shadow-sm hover:bg-primary-600 hover:text-white transition-all"><PhoneIcon className="w-5 h-5" /></a>
                      </div>
                  ))}
              </div>
          </main>
        );

      case 'app':
      default:
        return (
          <main className="container mx-auto px-4 lg:px-12 py-12 animate-slide-up">
              {/* Alert for Pending Users (Only for Admins) */}
              {isAdmin && pendingUsersCount > 0 && (
                <div 
                  onClick={() => setView('admin')}
                  className="mb-8 p-6 bg-rose-500 text-white rounded-[2.5rem] shadow-2xl shadow-rose-500/30 flex items-center justify-between cursor-pointer group hover:bg-rose-600 transition-all border-4 border-rose-400/20 animate-pulse"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                       <ClockIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-xl tracking-tight">Требуется подтверждение!</h4>
                      <p className="text-sm font-bold opacity-80">У вас {pendingUsersCount} новых заявок от сотрудников.</p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-white text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg group-hover:scale-110 transition-transform">Перейти</button>
                </div>
              )}

              <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Сеть объектов</h2>
                    <p className="text-slate-400 font-bold mt-2">Управление и мониторинг активных станций</p>
                  </div>
                  <div className="flex gap-4">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-6 py-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border-none shadow-sm font-black text-[11px] uppercase tracking-wider text-slate-600 cursor-pointer appearance-none border border-slate-100 dark:border-slate-800">
                      <option value="Все">Все статусы</option>
                      {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
              </div>
              <StationList stations={displayedStations} selectedStations={new Set()} allUsers={users} onEdit={(s) => { setEditingStation(s); setIsFormOpen(true); }} onDelete={(id) => { if(confirm('Удалить объект?')) setStations(stations.filter(s => s.id !== id)); }} onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))} onToggleSelection={() => {}} />
          </main>
        );
    }
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} onRegister={handleRegister} users={users} />;

  if (currentUser.status === UserStatus.PENDING) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
                  <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-[2.5rem] flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner">
                      <ClockIcon className="w-12 h-12 animate-pulse" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Доступ ограничен</h1>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10">Ваш аккаунт <b>{currentUser.name}</b> ожидает подтверждения администратором.</p>
                  <button onClick={() => setCurrentUser(null)} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl">Вернуться к логину</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 h-screen sticky top-0 z-40">
        <div className="p-8 pb-10 flex items-center gap-4">
           <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/30">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
           <div><h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge</h1></div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item: NavItem) => (
            <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative ${view === item.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm shadow-rose-500/50" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black">{currentUser.name.charAt(0)}</div>
              <div className="flex-1 min-w-0"><p className="text-xs font-black text-slate-900 dark:text-white truncate">{currentUser.name}</p></div>
              <button onClick={() => setCurrentUser(null)} className="text-slate-400 hover:text-rose-500"><LogoutIcon className="w-5 h-5" /></button>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-800/50 h-16 md:h-24 shrink-0 pt-safe flex items-center px-4 lg:px-10 justify-between">
            <div className="flex-1 max-w-2xl">
                <div className="relative">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" placeholder="Поиск объектов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-8 py-3 md:py-5 bg-slate-100 dark:bg-slate-800/50 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-900 dark:text-white" />
                </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="relative">
                  <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-white dark:bg-slate-800/50 shadow-sm border border-slate-100 dark:border-slate-700/50 text-slate-500 ${pendingUsersCount > 0 ? 'ring-4 ring-rose-500/20' : ''}`}>
                      <BellIcon className={`w-5 h-5 md:w-6 md:h-6 ${pendingUsersCount > 0 ? 'text-rose-500' : ''}`} />
                      {(userNotifications.some(n => !n.read) || pendingUsersCount > 0) && (
                        <span className={`absolute top-2 right-2 md:top-4 md:right-4 h-2 w-2 md:h-3 md:w-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 ${pendingUsersCount > 0 ? 'animate-ping' : ''}`} />
                      )}
                  </button>
                  {isNotifOpen && <div className="absolute right-0 mt-4 origin-top-right"><NotificationCenter notifications={userNotifications} onMarkAllAsRead={() => setNotifications(n => n.map(x => ({...x, read: true})))} onClose={() => setIsNotifOpen(false)} /></div>}
              </div>
              <button onClick={() => { setEditingStation(null); setIsFormOpen(true); }} className="hidden lg:flex px-6 py-4 bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Новый объект</button>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {renderMainContent()}
        </div>
      </div>

      <button onClick={() => { setEditingStation(null); setIsFormOpen(true); }} className="fixed z-50 right-10 bottom-10 w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all"><PlusIcon className="w-8 h-8" /></button>

      {isFormOpen && (
        <StationForm station={editingStation} currentUserName={currentUser.name} onSave={handleSaveStation} onClose={() => { setIsFormOpen(false); setEditingStation(null); }} allUsers={users.filter(u => u.status === UserStatus.APPROVED)} isAdmin={isAdmin} />
      )}
    </div>
  );
};

export default App;


import React, { useState, useMemo, useEffect } from 'react';
import { Station, StationStatus, HistoryEntry, User, UserStatus, UserRole, AppNotification, UserGroup, AppPermission } from './types';
import StationList from './components/StationList';
import StationForm from './components/StationForm';
import { PlusIcon, SearchIcon, UsersIcon, LogoutIcon, BellIcon, MapPinIcon, CogIcon, ChartPieIcon, PhoneIcon, WhatsAppIcon, ChevronDownIcon, ClockIcon } from './components/Icons';
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

const App: React.FC = () => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', INITIAL_STATIONS);
  const [users, setUsers] = useLocalStorage<User[]>('auth_users', []);
  const [userGroups, setUserGroups] = useLocalStorage<UserGroup[]>('auth_groups', DEFAULT_GROUPS);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('auth_currentUser', null);
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('app_notifications', []);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [filterStatus, setFilterStatus] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'app' | 'admin' | 'stats'>('app');

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
    // Уведомление для всех админов о новом пользователе
    const adminNotif: AppNotification = {
        id: 'n-' + Date.now(),
        message: `Новая заявка на регистрацию: ${newUser.name}. Требуется подтверждение.`,
        timestamp: new Date().toISOString(),
        author: 'Система Регистрации',
        read: false,
        type: 'warning'
    };
    setNotifications(prev => [adminNotif, ...prev]);
  };

  const handleSaveStation = (stationToSave: Station) => {
    const existingStation = stations.find(s => s.id === stationToSave.id);
    const isNew = !existingStation;
    
    if (stationToSave.assignedUserId && (!existingStation || existingStation.assignedUserId !== stationToSave.assignedUserId)) {
        const assignedUser = users.find(u => u.id === stationToSave.assignedUserId);
        if (assignedUser) {
            createNotification(
                `Вы назначены ответственным за объект: ${stationToSave.locationName}`,
                'assignment',
                assignedUser.id
            );
        }
    }

    const historyEntry: HistoryEntry = {
        id: 'h-' + Date.now(),
        date: new Date().toISOString(),
        employee: currentUser?.name || 'Система',
        change: isNew ? 'Создание объекта' : 'Обновление технических данных'
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
      return notifications.filter(n => !n.targetUserId || n.targetUserId === currentUser?.id || currentUser?.role === UserRole.ADMIN);
  }, [notifications, currentUser]);

  const navItems = [
    { id: 'app', label: 'Объекты', icon: MapPinIcon },
    { id: 'stats', label: 'Аналитика', icon: ChartPieIcon },
    { id: 'team', label: 'Команда', icon: UsersIcon },
    ...(currentUser?.role === UserRole.ADMIN ? [{ id: 'admin', label: 'Админ', icon: CogIcon }] : [])
  ];

  const handleNav = (id: string) => {
    if (id === 'team') {
      setIsTeamOpen(true);
    } else {
      setView(id as any);
      setIsTeamOpen(false);
    }
  };

  const openAddForm = () => {
    setEditingStation(null);
    setIsFormOpen(true);
  };

  if (!currentUser) return <Auth onLogin={setCurrentUser} onRegister={handleRegister} users={users} />;

  // Экран ожидания подтверждения
  if (currentUser.status === UserStatus.PENDING) {
      return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-in">
                  <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-[2.5rem] flex items-center justify-center text-amber-500 mx-auto mb-8 shadow-inner">
                      <ClockIcon className="w-12 h-12 animate-pulse" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Доступ ограничен</h1>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10">
                      Ваш аккаунт <b>{currentUser.name}</b> ожидает подтверждения администратором. Мы уведомили руководство о вашей регистрации.
                  </p>
                  <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 text-left">
                          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Статус: Проверка безопасности</p>
                      </div>
                      <button 
                        onClick={() => setCurrentUser(null)} 
                        className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                      >
                        Вернуться к логину
                      </button>
                  </div>
              </div>
              <p className="mt-12 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">Fast Charge Enterprise Security</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 h-screen sticky top-0 z-40">
        <div className="p-8 pb-10 flex items-center gap-4">
           <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/30">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
           </div>
           <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge</h1>
              <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none mt-1">Smart Network</p>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                (view === item.id && !isTeamOpen && item.id !== 'team') || (isTeamOpen && item.id === 'team')
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
           <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">{currentUser.role}</p>
              </div>
              <button onClick={() => setCurrentUser(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                 <LogoutIcon className="w-5 h-5" />
              </button>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="glass sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-800/50 h-16 md:h-24 shrink-0 pt-safe">
          <div className="container mx-auto px-4 lg:px-10 h-full flex justify-between items-center gap-4 md:gap-10">
            <div className="hidden lg:flex items-center gap-3">
               <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge</h1>
            </div>

            <div className="flex-1 max-w-2xl">
                <div className="relative group">
                    <SearchIcon className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Поиск объектов..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      className="w-full pl-11 md:pl-16 pr-4 md:pr-8 py-2.5 md:py-5 bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl md:rounded-[2rem] text-xs md:text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-900 dark:text-white" 
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative">
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)} 
                    className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-white dark:bg-slate-800/50 shadow-sm border border-slate-100 dark:border-slate-700/50 text-slate-500"
                  >
                      <BellIcon className="w-5 h-5 md:w-6 md:h-6" />
                      {userNotifications.some(n => !n.read) && <span className="absolute top-2 right-2 md:top-4 md:right-4 h-2 w-2 md:h-3 md:w-3 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />}
                  </button>
                  {isNotifOpen && (
                      <div className="absolute right-0 mt-4 origin-top-right">
                          <NotificationCenter 
                              notifications={userNotifications} 
                              onMarkAllAsRead={() => setNotifications(n => n.map(x => ({...x, read: true})))} 
                              onClose={() => setIsNotifOpen(false)} 
                          />
                      </div>
                  )}
              </div>
              
              <button 
                onClick={openAddForm}
                className="hidden lg:flex px-6 py-4 bg-primary-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
              >
                Новый объект
              </button>

              <button onClick={() => setCurrentUser(null)} className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
                  <LogoutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {view === 'admin' && currentUser.role === UserRole.ADMIN ? (
            <AdminPanel 
                users={users} setUsers={setUsers} stations={stations} setStations={setStations}
                userGroups={userGroups} setUserGroups={setUserGroups}
                inventoryCount={25} setInventoryCount={() => {}} notifications={notifications}
                onEditStation={(s) => { setEditingStation(s); setIsFormOpen(true); }}
                onDeleteStation={(id) => { if(confirm('Удалить объект?')) setStations(stations.filter(s => s.id !== id)); }}
                onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))}
                onAddStation={openAddForm}
                onBack={() => setView('app')}
                onSendMessage={(msg, type, userId) => createNotification(msg, type, userId)}
            />
          ) : view === 'stats' ? (
            <main className="container mx-auto px-4 lg:px-12 py-6 md:py-12">
                <NetworkSummary 
                    stations={stations} 
                    allUsers={users}
                    isAdmin={currentUser.role === UserRole.ADMIN}
                    onEdit={(s) => { setEditingStation(s); setIsFormOpen(true); }}
                    onDelete={(id) => { if(confirm('Удалить объект?')) setStations(stations.filter(s => s.id !== id)); }}
                    onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))}
                />
            </main>
          ) : (
            <main className="container mx-auto px-4 lg:px-12 py-6 md:py-12 animate-slide-up pb-32 lg:pb-12">
                <div className="mb-6 md:mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-10">
                    <div>
                        <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Сеть объектов</h2>
                        <p className="hidden md:block text-slate-500 font-medium text-lg lg:text-xl mt-4 max-w-2xl">Реестр и статусы зарядных станций Fast Charge.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                          <select 
                              value={filterStatus} 
                              onChange={e => setFilterStatus(e.target.value)} 
                              className="w-full sm:w-64 pl-6 pr-10 py-3 md:py-5 rounded-xl md:rounded-[2rem] bg-white dark:bg-slate-900 border-none shadow-sm font-black text-[10px] md:text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer focus:ring-4 focus:ring-primary-500/10 transition-all appearance-none"
                          >
                              <option value="Все">Все статусы</option>
                              {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronDownIcon className="w-4 h-4" />
                          </div>
                        </div>
                    </div>
                </div>

                <StationList 
                  stations={displayedStations} 
                  selectedStations={new Set()} 
                  allUsers={users}
                  onEdit={(s) => { setEditingStation(s); setIsFormOpen(true); }} 
                  onDelete={(id) => { if(confirm('Удалить объект?')) setStations(stations.filter(s => s.id !== id)); }} 
                  onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))} 
                  onToggleSelection={() => {}} 
                />
            </main>
          )}
        </div>
      </div>

      <button 
        onClick={openAddForm}
        className="fixed z-50 right-5 bottom-20 lg:bottom-10 lg:right-10 w-14 h-14 md:w-16 md:h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all group"
      >
        <PlusIcon className="w-7 h-7 md:w-8 md:h-8" />
      </button>

      <nav className="lg:hidden glass fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/50 dark:border-slate-800/50 pb-safe">
          <div className="flex justify-around items-center h-16 px-4">
              {navItems.map(item => (
                <button 
                    key={item.id} 
                    onClick={() => handleNav(item.id)}
                    className={`flex flex-col items-center gap-1 transition-all ${((view === item.id && !isTeamOpen) || (item.id === 'team' && isTeamOpen)) ? 'text-primary-600' : 'text-slate-400'}`}
                >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
          </div>
      </nav>

      {isTeamOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[110] flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-3xl md:rounded-[4rem] shadow-2xl overflow-hidden border border-white/5 h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col animate-slide-up">
                  <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Команда</h2>
                      </div>
                      <button 
                        onClick={() => setIsTeamOpen(false)} 
                        className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500"
                      >
                        ✕
                      </button>
                  </div>
                  <div className="p-4 md:p-10 overflow-y-auto space-y-4 scrollbar-hide flex-1">
                      {users.filter(u => u.status === UserStatus.APPROVED).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-4 md:p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl md:rounded-[3rem] border border-transparent hover:border-primary-100 transition-all">
                              <div className="flex items-center gap-4 md:gap-6 min-w-0">
                                  <div className="h-12 h-12 md:h-20 md:w-20 rounded-xl md:rounded-[1.75rem] bg-gradient-to-br from-primary-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl md:text-3xl shrink-0">{user.name.charAt(0)}</div>
                                  <div className="min-w-0">
                                      <h4 className="text-sm md:text-xl font-black text-slate-900 dark:text-white truncate">{user.name}</h4>
                                      <span className="inline-flex px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 rounded-md mt-1 text-[8px] md:text-[10px] font-black uppercase text-primary-600">{user.role}</span>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <a href={`tel:${user.phone}`} className="w-10 h-10 md:w-14 md:h-14 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-primary-600 border border-slate-100 shadow-sm"><PhoneIcon className="w-5 h-5 md:w-6 md:h-6" /></a>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-center pb-safe">
                    <button onClick={() => setIsTeamOpen(false)} className="w-full py-4 text-xs font-black uppercase tracking-widest text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">Закрыть</button>
                  </div>
              </div>
          </div>
      )}

      {isFormOpen && (
        <StationForm 
            station={editingStation} 
            currentUserName={currentUser.name} 
            onSave={handleSaveStation} 
            onClose={() => { setIsFormOpen(false); setEditingStation(null); }} 
            allUsers={users.filter(u => u.status === UserStatus.APPROVED)} 
            isAdmin={currentUser.role === UserRole.ADMIN} 
        />
      )}
    </div>
  );
};

export default App;

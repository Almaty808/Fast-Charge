
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Station, StationStatus, HistoryEntry, User, UserStatus, UserRole, AppNotification, UserGroup, AppPermission } from './types';
import StationList from './components/StationList';
import StationForm from './components/StationForm';
import { PlusIcon, PackageIcon, SearchIcon, DownloadIcon, UsersIcon, LogoutIcon, BellIcon, PhoneIcon, WhatsAppIcon, MapPinIcon, CogIcon, HistoryIcon, ChartPieIcon } from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import NotificationCenter from './components/NotificationCenter';
import NetworkSummary from './components/NetworkSummary';

const INITIAL_STATIONS: Station[] = [
  {
    id: '1',
    locationName: 'Кафе "Централь"',
    address: 'ул. Ленина, 1, Москва',
    installer: 'Иван Петров',
    installationDate: '2024-07-15',
    status: StationStatus.INSTALLED,
    notes: 'Установлено у входа, рядом с розеткой. Высокая проходимость.',
    coordinates: { lat: 55.7558, lng: 37.6173 },
    sid: 'SID-MOS-001',
    did: 'DID-CAFE-A1',
    sim: '89161234567',
    freeUsers: [
      {id: '1a', fullName: 'Ирина Петрова', position: 'Менеджер', phone: '+7 916 123-45-67'},
      {id: '1b', fullName: 'Сергей Васильев', position: 'Охрана', phone: '+7 926 765-43-21'}
    ],
    history: [
      { id: 'h1', date: '2024-07-15T10:00:00Z', employee: 'Иван Петров', change: 'Станция создана' }
    ],
    photos: []
  }
];

const DEFAULT_GROUPS: UserGroup[] = [
  {
    id: 'g-admin',
    name: 'Администраторы',
    description: 'Полный доступ ко всем функциям системы',
    permissions: Object.values(AppPermission)
  },
  {
    id: 'g-installer',
    name: 'Монтажники',
    description: 'Управление станциями и просмотр статистики',
    permissions: [AppPermission.MANAGE_STATIONS, AppPermission.VIEW_STATS]
  }
];

const App: React.FC = () => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', INITIAL_STATIONS);
  const [inventoryCount, setInventoryCount] = useLocalStorage<number>('inventoryCount', 20);
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
  const [selectedStations, setSelectedStations] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'app' | 'admin' | 'stats'>('app');

  useEffect(() => {
    const masterAdminEmail = 'almaty808@gmail.com';
    const masterAdmin = users.find(u => u.email === masterAdminEmail);
    
    if (!masterAdmin) {
      const defaultAdmin: User = {
        id: 'admin-master',
        name: 'Главный Администратор',
        email: masterAdminEmail,
        phone: '+7 (777) 808-88-88',
        password: '1qazaq1',
        status: UserStatus.APPROVED,
        role: UserRole.ADMIN,
        groupId: 'g-admin'
      };
      setUsers([defaultAdmin, ...users]);
    } else if (masterAdmin.password !== '1qazaq1') {
      setUsers(users.map(u => u.email === masterAdminEmail ? { ...u, password: '1qazaq1', role: UserRole.ADMIN, groupId: 'g-admin' } : u));
    }
  }, [users, setUsers]);

  const createNotification = (message: string, type: AppNotification['type'] = 'info', targetUserId?: string) => {
    const newNotif: AppNotification = {
        id: Date.now().toString(),
        message,
        timestamp: new Date().toISOString(),
        author: currentUser?.name || 'Система',
        read: false,
        type,
        targetUserId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleSaveStation = (stationToSave: Station) => {
    const oldStation = stations.find(s => s.id === stationToSave.id);
    if (oldStation && oldStation.status !== StationStatus.INSTALLED && stationToSave.status === StationStatus.INSTALLED) {
        createNotification(`Сотрудник ${currentUser?.name} завершил установку на объекте: ${stationToSave.locationName}`, 'success');
    }
    if (currentUser?.role === UserRole.ADMIN && stationToSave.assignedUserId && stationToSave.assignedUserId !== oldStation?.assignedUserId) {
        const assignedUser = users.find(u => u.id === stationToSave.assignedUserId);
        if (assignedUser) {
            createNotification(`Вам назначена новая задача: установка станции в "${stationToSave.locationName}"`, 'assignment', assignedUser.id);
        }
    }
    if (oldStation) { 
      setStations(stations.map(s => s.id === stationToSave.id ? stationToSave : s));
    } else { 
      setInventoryCount(prev => prev - 1);
      setStations([stationToSave, ...stations]);
    }
    setIsFormOpen(false);
    setEditingStation(null);
  };

  const handleLogout = () => { setCurrentUser(null); setView('app'); };

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

  if (!currentUser) return <Auth onLogin={setCurrentUser} users={users} setUsers={setUsers} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 pb-20 md:pb-0">
      <header className="glass sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 shadow-sm pt-safe">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3">
             <div className="bg-primary-600 p-1.5 md:p-2 rounded-xl shadow-lg shadow-primary-500/20">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tighter cursor-pointer" onClick={() => setView('app')}>Fast Charge</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('stats')} className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${view === 'stats' ? 'bg-primary-100 text-primary-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                <ChartPieIcon className="w-4 h-4" /> Сеть
            </button>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700">
                <div className="relative">
                    <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all relative">
                        <BellIcon className="w-5 h-5" />
                        {userNotifications.some(n => !n.read) && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />}
                    </button>
                    {isNotifOpen && <NotificationCenter notifications={userNotifications} onMarkAllAsRead={() => setNotifications(n => n.map(x => ({...x, read: true})))} onClose={() => setIsNotifOpen(false)} />}
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><LogoutIcon className="w-5 h-5" /></button>
            </div>
            <button onClick={() => { setEditingStation(null); setIsFormOpen(true); }} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/30 transition-all active:scale-95">
                <PlusIcon className="w-5 h-5" /> <span>Добавить</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto min-h-[calc(100vh-140px)]">
        {view === 'admin' && currentUser.role === UserRole.ADMIN ? (
          <AdminPanel 
              users={users} setUsers={setUsers} stations={stations} setStations={setStations}
              userGroups={userGroups} setUserGroups={setUserGroups}
              inventoryCount={inventoryCount} setInventoryCount={setInventoryCount} notifications={notifications}
              onEditStation={(s) => { setEditingStation(s); setIsFormOpen(true); }}
              onDeleteStation={(id) => setStations(stations.filter(s => s.id !== id))}
              onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))}
              onAddStation={() => { setEditingStation(null); setIsFormOpen(true); }}
              onBack={() => setView('app')}
              onSendMessage={(msg, type, userId) => createNotification(msg, type, userId)}
          />
        ) : view === 'stats' ? (
          <main className="container mx-auto px-4 md:px-6 py-6 md:py-10"><NetworkSummary stations={stations} /></main>
        ) : (
          <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 animate-slide-up">
              <div className="mb-6 md:mb-10 flex flex-col md:flex-row gap-3 md:gap-4">
                  <div className="relative flex-1">
                      <SearchIcon className="absolute left-4 top-3 h-5 w-5 text-slate-400 md:top-3.5" />
                      <input type="text" placeholder="Поиск..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3 md:py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-4 focus:ring-primary-500/20 transition-all text-slate-900 dark:text-white font-medium text-sm md:text-base" />
                  </div>
                  <div className="flex gap-2">
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm focus:ring-4 focus:ring-primary-500/20 transition-all font-bold text-xs md:text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
                          <option value="Все">Все статусы</option>
                          {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
              </div>
              <StationList stations={displayedStations} selectedStations={selectedStations} onEdit={(s) => { setEditingStation(s); setIsFormOpen(true); }} onDelete={(id) => setStations(stations.filter(s => s.id !== id))} onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))} onToggleSelection={(id) => { const next = new Set(selectedStations); if (next.has(id)) next.delete(id); else next.add(id); setSelectedStations(next); }} />
          </main>
        )}
      </div>

      <nav className="md:hidden glass fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-800 pb-safe">
          <div className="flex justify-around items-center h-16">
              <button onClick={() => { setView('app'); setIsTeamOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${view === 'app' && !isTeamOpen ? 'text-primary-600' : 'text-slate-400'}`}>
                  <MapPinIcon className="w-6 h-6" /><span className="text-[10px] font-bold">Карта</span>
              </button>
              <button onClick={() => { setView('stats'); setIsTeamOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${view === 'stats' && !isTeamOpen ? 'text-primary-600' : 'text-slate-400'}`}>
                  <ChartPieIcon className="w-6 h-6" /><span className="text-[10px] font-bold">Сеть</span>
              </button>
              <div className="relative -top-4">
                  <button onClick={() => { setEditingStation(null); setIsFormOpen(true); }} className="h-14 w-14 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-primary-500/40 active:scale-90 transition-transform"><PlusIcon className="w-8 h-8" /></button>
              </div>
              <button onClick={() => { setIsTeamOpen(true); }} className={`flex flex-col items-center gap-1 transition-all ${isTeamOpen ? 'text-primary-600' : 'text-slate-400'}`}>
                  <UsersIcon className="w-6 h-6" /><span className="text-[10px] font-bold">Команда</span>
              </button>
              {currentUser.role === UserRole.ADMIN && (
                <button onClick={() => { setView(view === 'admin' ? 'app' : 'admin'); setIsTeamOpen(false); }} className={`flex flex-col items-center gap-1 transition-all ${view === 'admin' ? 'text-primary-600' : 'text-slate-400'}`}>
                    <CogIcon className="w-6 h-6" /><span className="text-[10px] font-bold">Админ</span>
                </button>
              )}
          </div>
      </nav>

      {isTeamOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-0 md:p-6">
              <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-t-4xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-mobile-form border border-slate-100 dark:border-slate-800 h-[90vh] md:h-auto flex flex-col">
                  <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                      <div><h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Команда проекта</h2><p className="text-xs md:text-sm text-slate-500 font-medium">Активные участники</p></div>
                      <button onClick={() => setIsTeamOpen(false)} className="p-2 md:p-3 bg-slate-100 dark:bg-slate-800 rounded-full">✕</button>
                  </div>
                  <div className="p-4 md:p-8 overflow-y-auto space-y-3 md:space-y-4 scrollbar-hide flex-1">
                      {users.filter(u => u.status === UserStatus.APPROVED).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg md:text-xl shrink-0 shadow-lg">{user.name.charAt(0)}</div>
                                  <div className="min-w-0"><h4 className="font-bold text-slate-900 dark:text-white truncate">{user.name}</h4><span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300">{user.role}</span></div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                  <a href={`tel:${user.phone}`} className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-primary-600 border border-slate-200 dark:border-slate-600 active:scale-90 transition-transform"><PhoneIcon className="w-5 h-5" /></a>
                                  <a href={`https://wa.me/${user.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-green-500 border border-slate-200 dark:border-slate-600 active:scale-90 transition-transform"><WhatsAppIcon className="w-5 h-5" /></a>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0 md:hidden pb-safe"><button onClick={() => setIsTeamOpen(false)} className="w-full py-4 text-sm font-bold text-slate-500 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">Закрыть</button></div>
              </div>
          </div>
      )}

      {isFormOpen && <StationForm station={editingStation} currentUserName={currentUser.name} onSave={handleSaveStation} onClose={() => { setIsFormOpen(false); setEditingStation(null); }} allUsers={users.filter(u => u.status === UserStatus.APPROVED)} isAdmin={currentUser.role === UserRole.ADMIN} />}
    </div>
  );
};

export default App;

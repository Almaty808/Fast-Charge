
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Station, StationStatus, HistoryEntry, User, UserStatus, UserRole, AppNotification } from './types';
import StationList from './components/StationList';
import StationForm from './components/StationForm';
// Add missing MapPinIcon and CogIcon to the imports
import { PlusIcon, PackageIcon, SearchIcon, DownloadIcon, UsersIcon, LogoutIcon, BellIcon, PhoneIcon, WhatsAppIcon, MapPinIcon, CogIcon } from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import NotificationCenter from './components/NotificationCenter';

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
    ]
  },
  {
    id: '2',
    locationName: 'ТРЦ "Галерея"',
    address: 'пр. Невский, 35, Санкт-Петербург',
    installer: 'Елена Сидорова',
    installationDate: '2024-07-20',
    status: StationStatus.PLANNED,
    notes: 'Планируется установка на 2 этаже в фуд-корте.',
    coordinates: { lat: 59.9343, lng: 30.3351 },
    sid: 'SID-SPB-015',
    did: 'DID-GALLERY-F2',
    sim: '89217654321',
    freeUsers: [
      {id: '2a', fullName: 'Администрация ТРЦ', position: 'Дежурный администратор', phone: '+7 812 555-00-00'}
    ],
    history: [
        { id: 'h2', date: '2024-07-18T12:00:00Z', employee: 'Елена Сидорова', change: 'Станция создана' }
    ]
  }
];

const generateHistoryEntry = (employee: string, change: string): HistoryEntry => ({
  id: new Date().toISOString() + Math.random(),
  date: new Date().toISOString(),
  employee,
  change,
});

const diffStations = (oldS: Station, newS: Station): string[] => {
    const changes: string[] = [];
    const fields: { key: keyof Station; label: string }[] = [
        { key: 'locationName', label: 'Название' }, { key: 'address', label: 'Адрес' },
        { key: 'status', label: 'Статус' }, { key: 'notes', label: 'Заметки' },
        { key: 'sid', label: 'SID' }, { key: 'did', label: 'DID' }, { key: 'sim', label: 'SIM' }
    ];
    fields.forEach(({ key, label }) => {
        if ((oldS[key] || '') !== (newS[key] || '')) {
            changes.push(`${label} изменено`);
        }
    });
    return changes;
};

const App: React.FC = () => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', INITIAL_STATIONS);
  const [inventoryCount, setInventoryCount] = useLocalStorage<number>('inventoryCount', 20);
  const [users, setUsers] = useLocalStorage<User[]>('auth_users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('auth_currentUser', null);
  const [notifications, setNotifications] = useLocalStorage<AppNotification[]>('app_notifications', []);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [filterStatus, setFilterStatus] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStations, setSelectedStations] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'app' | 'admin'>('app');

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adminExists = users.some(u => u.role === UserRole.ADMIN);
    if (!adminExists) {
      const defaultAdmin: User = {
        id: 'admin-' + Date.now(),
        name: 'Главный Администратор',
        email: 'almaty808@gmail.com',
        phone: '+7 (777) 808-88-88',
        password: '123qweasdzxc',
        status: UserStatus.APPROVED,
        role: UserRole.ADMIN,
      };
      setUsers([defaultAdmin, ...users]);
    }
  }, [users, setUsers]);

  const addNotification = (message: string, type: AppNotification['type'] = 'info') => {
      const newNotif: AppNotification = {
          id: Math.random().toString(36).substr(2, 9),
          message,
          timestamp: new Date().toISOString(),
          author: currentUser?.name || 'Система',
          read: false,
          type
      };
      setNotifications(prev => [newNotif, ...prev].slice(0, 100));
  };

  const handleSaveStation = (stationToSave: Station) => {
    const oldStation = stations.find(s => s.id === stationToSave.id);
    let newHistory: HistoryEntry[] = [...(stationToSave.history || [])];

    if (oldStation) { 
      const changes = diffStations(oldStation, stationToSave);
      changes.forEach(change => newHistory.unshift(generateHistoryEntry(currentUser!.name, change)));
      setStations(stations.map(s => s.id === stationToSave.id ? { ...stationToSave, history: newHistory } : s));
    } else { 
      setInventoryCount(prev => prev - 1);
      newHistory.unshift(generateHistoryEntry(currentUser!.name, "Станция создана"));
      setStations([{ ...stationToSave, history: newHistory }, ...stations]);
    }
    setIsFormOpen(false);
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

  if (!currentUser) return <Auth onLogin={setCurrentUser} users={users} setUsers={setUsers} />;

  const formatWhatsAppLink = (p: string) => `https://wa.me/${p.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-600 hidden sm:block">ChargeManager</h1>
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold bg-slate-100 dark:bg-slate-700 p-2 rounded-lg flex items-center gap-2">
                <PackageIcon className="w-4 h-4 text-primary-500" />
                <span>Склад: {inventoryCount}</span>
            </div>
            
            <button onClick={() => setIsTeamOpen(true)} className="p-2 text-slate-500 hover:text-primary-600 transition-colors" title="Команда">
                <UsersIcon className="w-6 h-6" />
            </button>

            <div className="relative">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="p-2 text-slate-500 hover:text-primary-600 transition-colors relative">
                    <BellIcon className="w-6 h-6" />
                    {notifications.some(n => !n.read) && <span className="absolute top-1.5 right-1.5 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />}
                </button>
                {isNotifOpen && <NotificationCenter notifications={notifications} onMarkAllAsRead={() => setNotifications(n => n.map(x => ({...x, read: true})))} onClose={() => setIsNotifOpen(false)} />}
            </div>

            {currentUser.role === UserRole.ADMIN && (
                <button onClick={() => setView(view === 'admin' ? 'app' : 'admin')} className="p-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    {view === 'admin' ? <MapPinIcon className="w-6 h-6" /> : <CogIcon className="w-6 h-6" />}
                </button>
            )}

            <button onClick={handleLogout} className="p-2 text-red-500"><LogoutIcon className="w-6 h-6" /></button>
            
            <button onClick={() => setIsFormOpen(true)} className="p-2 bg-primary-600 text-white rounded-lg"><PlusIcon className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      {view === 'admin' && currentUser.role === UserRole.ADMIN ? (
        <AdminPanel 
            users={users} setUsers={setUsers} stations={stations} setStations={setStations}
            inventoryCount={inventoryCount} setInventoryCount={setInventoryCount} notifications={notifications}
            onEditStation={(s) => { setEditingStation(s); setIsFormOpen(true); }}
            onDeleteStation={(id) => setStations(stations.filter(s => s.id !== id))}
            onStatusChange={(id, st) => setStations(stations.map(s => s.id === id ? {...s, status: st} : s))}
            onAddStation={() => { setEditingStation(null); setIsFormOpen(true); }}
            onBack={() => setView('app')}
        />
      ) : (
        <main className="container mx-auto px-4 py-8">
            <div className="mb-6 flex gap-4">
                <input type="text" placeholder="Поиск станций..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                    <option value="Все">Все статусы</option>
                    {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <StationList stations={displayedStations} selectedStations={selectedStations} onEdit={(s) => { setEditingStation(s); setIsFormOpen(true); }} onDelete={() => {}} onStatusChange={() => {}} onToggleSelection={() => {}} />
        </main>
      )}

      {/* Team Modal */}
      {isTeamOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-primary-600 text-white">
                      <div>
                        <h2 className="text-xl font-bold">Наша Команда</h2>
                        <p className="text-xs opacity-80">Список всех активных сотрудников</p>
                      </div>
                      <button onClick={() => setIsTeamOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">✕</button>
                  </div>
                  <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                      {users.filter(u => u.status === UserStatus.APPROVED).map(user => (
                          <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600 gap-4">
                              <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-lg">
                                      {user.name.charAt(0)}
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{user.name}</h4>
                                      <p className="text-xs text-slate-500">{user.role}</p>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className="text-right hidden sm:block">
                                      <p className="text-sm font-bold">{user.phone}</p>
                                      <p className="text-[10px] text-slate-400">{user.email}</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <a href={`tel:${user.phone}`} className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-primary-600 border border-slate-200 dark:border-slate-600">
                                          <PhoneIcon className="w-5 h-5" />
                                      </a>
                                      <a href={formatWhatsAppLink(user.phone)} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-green-500 border border-slate-200 dark:border-slate-600">
                                          <WhatsAppIcon className="w-5 h-5" />
                                      </a>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center">
                      <button onClick={() => setIsTeamOpen(false)} className="text-sm font-bold text-slate-500 hover:text-slate-800">Закрыть</button>
                  </div>
              </div>
          </div>
      )}

      {isFormOpen && (
        <StationForm
          station={editingStation}
          currentUserName={currentUser.name}
          onSave={handleSaveStation}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

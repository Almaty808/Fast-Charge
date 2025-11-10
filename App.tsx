import React, { useState, useMemo } from 'react';
import { Station, StationStatus, HistoryEntry, FreeUser } from './types';
import StationList from './components/StationList';
import StationForm from './components/StationForm';
import { PlusIcon, PackageIcon, SearchIcon, DownloadIcon } from './components/Icons';
import useLocalStorage from './hooks/useLocalStorage';

const EMPLOYEES = ['Иван Петров', 'Елена Сидорова', 'Алексей Иванов', 'Ольга Кузнецова'];

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
  },
  {
    id: '3',
    locationName: 'Аэропорт "Кольцово"',
    address: 'пл. Бахчиванджи, 1, Екатеринбург',
    installer: 'Алексей Иванов',
    installationDate: '2024-06-10',
    status: StationStatus.MAINTENANCE,
    notes: 'Один из USB-портов не работает. Требуется замена кабеля.',
    coordinates: null,
    history: [
        { id: 'h3b', date: '2024-06-25T15:30:00Z', employee: 'Алексей Иванов', change: 'Статус изменен с "Установлено" на "Обслуживание"' },
        { id: 'h3a', date: '2024-06-10T09:00:00Z', employee: 'Алексей Иванов', change: 'Станция создана' }
    ]
  },
];

const generateHistoryEntry = (employee: string, change: string): HistoryEntry => ({
  id: new Date().toISOString() + Math.random(),
  date: new Date().toISOString(),
  employee,
  change,
});

const diffStations = (oldS: Station, newS: Station): string[] => {
    const changes: string[] = [];
    
    const simpleFields: { key: keyof Station; label: string }[] = [
        { key: 'locationName', label: 'Название местоположения' },
        { key: 'address', label: 'Адрес' },
        { key: 'status', label: 'Статус' },
        { key: 'notes', label: 'Заметки' },
        { key: 'sid', label: 'SID' },
        { key: 'did', label: 'DID' },
        { key: 'sim', label: 'SIM' },
        { key: 'installer', label: 'Установщик' },
        { key: 'installationDate', label: 'Дата установки' },
    ];

    simpleFields.forEach(({ key, label }) => {
        const oldVal = oldS[key] as string || '';
        const newVal = newS[key] as string || '';
        if (oldVal !== newVal) {
            changes.push(`${label} изменено с "${oldVal || 'пусто'}" на "${newVal || 'пусто'}"`);
        }
    });

    const oldUsers = oldS.freeUsers || [];
    const newUsers = newS.freeUsers || [];
    
    newUsers.forEach(newUser => {
        const oldUser = oldUsers.find(u => u.id === newUser.id);
        if (!oldUser) {
            changes.push(`Добавлен пользователь: ${newUser.fullName}`);
        } else {
            const userChanges = [];
            if (oldUser.fullName !== newUser.fullName) userChanges.push(`ФИО с "${oldUser.fullName}" на "${newUser.fullName}"`);
            if ((oldUser.position || '') !== (newUser.position || '')) userChanges.push(`должность с "${oldUser.position || 'пусто'}" на "${newUser.position || 'пусто'}"`);
            if ((oldUser.phone || '') !== (newUser.phone || '')) userChanges.push(`телефон с "${oldUser.phone || 'пусто'}" на "${newUser.phone || 'пусто'}"`);
            if (userChanges.length > 0) {
                changes.push(`Изменены данные пользователя ${newUser.fullName}: ${userChanges.join(', ')}`);
            }
        }
    });
    
    oldUsers.forEach(oldUser => {
        if (!newUsers.find(u => u.id === oldUser.id)) {
            changes.push(`Удален пользователь: ${oldUser.fullName}`);
        }
    });

    return changes;
};

const App: React.FC = () => {
  const [stations, setStations] = useLocalStorage<Station[]>('stations', INITIAL_STATIONS);
  const [inventoryCount, setInventoryCount] = useLocalStorage<number>('inventoryCount', 20);
  const [currentEmployee, setCurrentEmployee] = useState<string>(EMPLOYEES[0]);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('Все');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStations, setSelectedStations] = useState<Set<string>>(new Set());

  const handleSaveStation = (stationToSave: Station) => {
    const oldStation = stations.find(s => s.id === stationToSave.id);
    let newHistory: HistoryEntry[] = [...(stationToSave.history || [])];

    if (oldStation) { // Редактирование существующей станции
      if (oldStation.status !== StationStatus.REMOVED && stationToSave.status === StationStatus.REMOVED) {
        setInventoryCount(prev => prev + 1);
      } else if (oldStation.status === StationStatus.REMOVED && stationToSave.status !== StationStatus.REMOVED) {
        if (inventoryCount > 0) {
          setInventoryCount(prev => prev - 1);
        } else {
          alert("Нет станций в остатке для повторной установки!");
          stationToSave.status = StationStatus.REMOVED; // Отменяем изменение статуса
        }
      }
      
      const changes = diffStations(oldStation, stationToSave);
      if (changes.length > 0) {
          changes.forEach(change => {
              newHistory.unshift(generateHistoryEntry(currentEmployee, change));
          });
      }

      setStations(stations.map(s => s.id === stationToSave.id ? { ...stationToSave, history: newHistory } : s));
    } else { // Добавление новой станции
      if (inventoryCount > 0) {
        setInventoryCount(prev => prev - 1);
        newHistory.unshift(generateHistoryEntry(currentEmployee, "Станция создана"));
        setStations([{ ...stationToSave, history: newHistory }, ...stations]);
      } else {
        alert("Нельзя добавить станцию: нет в наличии на складе.");
        return; // Прерываем сохранение
      }
    }
    closeForm();
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту станцию? Это действие изменит ее статус на "Удалено" и вернет на склад.')) {
      handleStatusChange(id, StationStatus.REMOVED);
    }
  };
  
  const handleStatusChange = (id: string, status: StationStatus) => {
    const oldStation = stations.find(s => s.id === id);
    if (!oldStation || oldStation.status === status) return;

    if (oldStation.status !== StationStatus.REMOVED && status === StationStatus.REMOVED) {
        setInventoryCount(prev => prev + 1);
    } else if (oldStation.status === StationStatus.REMOVED && status !== StationStatus.REMOVED) {
        if (inventoryCount > 0) {
            setInventoryCount(prev => prev - 1);
        } else {
            alert("Нет станций в остатке для повторной установки!");
            return; // Не меняем статус
        }
    }
    
    const newHistory = [
      generateHistoryEntry(currentEmployee, `Статус изменен с "${oldStation.status}" на "${status}"`),
      ...oldStation.history
    ];

    setStations(stations.map(s => s.id === id ? { ...s, status, history: newHistory } : s));
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStation(null);
  };

  const openForm = () => {
    setEditingStation(null);
    setIsFormOpen(true);
  };
  
  const displayedStations = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    const statusFiltered = filterStatus === 'Все'
      ? stations
      : stations.filter(s => s.status === filterStatus);

    if (!normalizedQuery) {
      return statusFiltered;
    }

    return statusFiltered.filter(station => {
      const queryDigits = normalizedQuery.replace(/\D/g, '');

      const matchesLocation = station.locationName.toLowerCase().includes(normalizedQuery);
      const matchesSid = station.sid?.toLowerCase().includes(normalizedQuery) ?? false;
      const matchesDid = station.did?.toLowerCase().includes(normalizedQuery) ?? false;
      const matchesSim = station.sim?.toLowerCase().includes(normalizedQuery) ?? false;
      const matchesDate = new Date(station.installationDate).toLocaleDateString('ru-RU').includes(normalizedQuery);
      const matchesUser = station.freeUsers?.some(user =>
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        (user.phone && user.phone.replace(/\D/g, '').includes(queryDigits) && queryDigits.length > 0)
      ) ?? false;

      return matchesLocation || matchesSid || matchesDid || matchesSim || matchesDate || matchesUser;
    });
  }, [stations, filterStatus, searchQuery]);

  const handleToggleSelection = (id: string) => {
    setSelectedStations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = () => {
    const displayedIds = new Set(displayedStations.map(s => s.id));
    const allDisplayedSelected = displayedStations.length > 0 && displayedStations.every(s => selectedStations.has(s.id));
  
    if (allDisplayedSelected) {
      // Deselect all displayed
      setSelectedStations(prev => {
        const newSet = new Set(prev);
        displayedIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all displayed
      setSelectedStations(prev => {
        const newSet = new Set(prev);
        displayedIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  };

  const handleExport = (stationsToExport: Station[]) => {
    if (stationsToExport.length === 0) {
      alert("Нет станций для экспорта.");
      return;
    }

    const headers = [
      "ID", "Название местоположения", "Адрес", "Установщик", "Дата установки",
      "Статус", "SID", "DID", "SIM", "Широта", "Долгота", "Заметки", "Бесплатные пользователи"
    ];

    const rows = stationsToExport.map(station => {
      const freeUsersString = station.freeUsers?.map(user =>
        `ФИО: ${user.fullName || ''}; Должность: ${user.position || ''}; Телефон: ${user.phone || ''}`
      ).join(' | ') || '';

      const escapeCSV = (field: string | number | null | undefined) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCSV(station.id),
        escapeCSV(station.locationName),
        escapeCSV(station.address),
        escapeCSV(station.installer),
        escapeCSV(new Date(station.installationDate).toLocaleDateString('ru-RU')),
        escapeCSV(station.status),
        escapeCSV(station.sid),
        escapeCSV(station.did),
        escapeCSV(station.sim),
        escapeCSV(station.coordinates?.lat),
        escapeCSV(station.coordinates?.lng),
        escapeCSV(station.notes),
        escapeCSV(freeUsersString),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `stations_export_${date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Учет Зарядных Станций</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 p-2 rounded-md bg-slate-100 dark:bg-slate-700">
                <PackageIcon className="w-6 h-6 text-primary-500" />
                <span>В остатке: {inventoryCount}</span>
            </div>
            <select
              value={currentEmployee}
              onChange={(e) => setCurrentEmployee(e.target.value)}
              className="block w-full sm:w-auto text-sm rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
            >
              {EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
            </select>
            <button
              onClick={openForm}
              disabled={inventoryCount <= 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
              title={inventoryCount <= 0 ? "Нет станций в наличии" : "Добавить новую станцию"}
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Добавить станцию</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full sm:w-auto text-sm rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
              >
                  <option value="Все">Все статусы</option>
                  {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="relative w-full sm:w-64">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <SearchIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                      type="search"
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-md border-slate-300 dark:border-slate-600 py-2 pl-10 pr-3 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                  />
              </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                id="selectAll"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                checked={displayedStations.length > 0 && displayedStations.every(s => selectedStations.has(s.id))}
                onChange={handleToggleSelectAll}
                disabled={displayedStations.length === 0}
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Выбрать все на странице ({displayedStations.length})
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport(displayedStations)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={displayedStations.length === 0}
              >
                <DownloadIcon className="w-4 h-4" />
                Выгрузить отфильтрованные
              </button>
              {selectedStations.size > 0 && (
                <button
                  onClick={() => handleExport(stations.filter(s => selectedStations.has(s.id)))}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 dark:bg-primary-900/50 dark:text-primary-300 dark:hover:bg-primary-900/80 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Выгрузить выбранные ({selectedStations.size})
                </button>
              )}
            </div>
          </div>
        </div>

        <StationList
          stations={displayedStations}
          selectedStations={selectedStations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onToggleSelection={handleToggleSelection}
        />
      </main>

      {isFormOpen && (
        <StationForm
          station={editingStation}
          currentEmployee={currentEmployee}
          onSave={handleSaveStation}
          onClose={closeForm}
        />
      )}
    </div>
  );
};

export default App;
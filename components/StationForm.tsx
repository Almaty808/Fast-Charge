import React, { useState, useEffect } from 'react';
import { Station, StationStatus, FreeUser } from '../types';
import { generateInstallationNotes } from '../services/geminiService';
import { SparklesIcon, PlusIcon, TrashIcon } from './Icons';

interface StationFormProps {
  station: Station | null;
  currentEmployee: string;
  onSave: (station: Station) => void;
  onClose: () => void;
}

type FormData = Omit<Station, 'id' | 'history'>;

const StationForm: React.FC<StationFormProps> = ({ station, currentEmployee, onSave, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    locationName: '',
    address: '',
    installer: currentEmployee,
    installationDate: new Date().toISOString().split('T')[0],
    status: StationStatus.PLANNED,
    notes: '',
    coordinates: null,
    sid: '',
    did: '',
    sim: '',
    freeUsers: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (station) {
      setFormData({
          ...station,
          sid: station.sid || '',
          did: station.did || '',
          sim: station.sim || '',
          freeUsers: station.freeUsers || [],
      });
    } else {
        // Reset form for new station
        setFormData({
            locationName: '',
            address: '',
            installer: currentEmployee,
            installationDate: new Date().toISOString().split('T')[0],
            status: StationStatus.PLANNED,
            notes: '',
            coordinates: null,
            sid: '',
            did: '',
            sim: '',
            freeUsers: [],
        });
    }
  }, [station, currentEmployee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const tempCoords = {
            lat: prev.coordinates?.lat,
            lng: prev.coordinates?.lng,
            ...prev.coordinates,
        };

        const parsedValue = value === '' ? undefined : parseFloat(value);
        if (value !== '' && isNaN(parsedValue!)) {
            return prev;
        }

        if (name === 'lat') {
            tempCoords.lat = parsedValue;
        } else if (name === 'lng') {
            tempCoords.lng = parsedValue;
        }
        
        if (tempCoords.lat === undefined && tempCoords.lng === undefined) {
          return { ...prev, coordinates: null };
        }

        return { ...prev, coordinates: tempCoords as any };
    });
  };

  const handleGenerateNotes = async () => {
    if (!formData.locationName || !formData.address) {
      alert("Пожалуйста, сначала укажите название и адрес местоположения.");
      return;
    }
    setIsGenerating(true);
    try {
      const notes = await generateInstallationNotes(formData.locationName, formData.address);
      setFormData(prev => ({ ...prev, notes }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUserChange = (id: string, field: keyof Omit<FreeUser, 'id'>, value: string) => {
    setFormData(prev => ({
        ...prev,
        freeUsers: prev.freeUsers?.map(user => 
            user.id === id ? { ...user, [field]: value } : user
        )
    }));
  };

  const handleAddUser = () => {
    setFormData(prev => ({
        ...prev,
        freeUsers: [...(prev.freeUsers || []), { id: new Date().toISOString(), fullName: '', position: '', phone: '' }]
    }));
  };

  const handleRemoveUser = (id: string) => {
    setFormData(prev => ({
        ...prev,
        freeUsers: prev.freeUsers?.filter(user => user.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave: Omit<Station, 'id' | 'history'> = {
        ...formData,
        sid: formData.sid || undefined,
        did: formData.did || undefined,
        sim: formData.sim || undefined,
        freeUsers: formData.freeUsers?.filter(u => u.fullName.trim() !== ''),
    };
    
    if (dataToSave.coordinates && (typeof dataToSave.coordinates.lat !== 'number' || typeof dataToSave.coordinates.lng !== 'number')) {
        dataToSave.coordinates = null;
    }

    onSave({
      id: station ? station.id : new Date().toISOString(),
      ...dataToSave,
      history: station?.history || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto pt-10">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up mb-10">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{station ? 'Редактировать станцию' : 'Добавить новую станцию'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="locationName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Название местоположения</label>
            <input type="text" name="locationName" id="locationName" value={formData.locationName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Адрес</label>
            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
          </div>

          <fieldset className="p-4 border border-slate-300 dark:border-slate-600 rounded-md">
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">Геопозиция (необязательно)</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                    <label htmlFor="lat" className="block text-xs font-medium text-slate-600 dark:text-slate-400">Широта</label>
                    <input 
                        type="number" 
                        name="lat" 
                        id="lat" 
                        value={(formData.coordinates as any)?.lat ?? ''}
                        onChange={handleCoordinatesChange} 
                        step="any"
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" 
                        placeholder="e.g. 55.7558"
                    />
                </div>
                <div>
                    <label htmlFor="lng" className="block text-xs font-medium text-slate-600 dark:text-slate-400">Долгота</label>
                    <input 
                        type="number" 
                        name="lng" 
                        id="lng" 
                        value={(formData.coordinates as any)?.lng ?? ''}
                        onChange={handleCoordinatesChange} 
                        step="any"
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" 
                        placeholder="e.g. 37.6173"
                    />
                </div>
            </div>
          </fieldset>

           <fieldset className="p-4 border border-slate-300 dark:border-slate-600 rounded-md">
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">Дополнительные параметры</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div>
                    <label htmlFor="sid" className="block text-xs font-medium text-slate-600 dark:text-slate-400">SID</label>
                    <input type="text" name="sid" id="sid" value={formData.sid || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
                </div>
                <div>
                    <label htmlFor="did" className="block text-xs font-medium text-slate-600 dark:text-slate-400">DID</label>
                    <input type="text" name="did" id="did" value={formData.did || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
                </div>
                 <div>
                    <label htmlFor="sim" className="block text-xs font-medium text-slate-600 dark:text-slate-400">SIM</label>
                    <input type="text" name="sim" id="sim" value={formData.sim || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
                </div>
            </div>
          </fieldset>

          <fieldset className="p-4 border border-slate-300 dark:border-slate-600 rounded-md">
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">Бесплатные пользователи</legend>
            <div className="space-y-3 mt-2">
                {formData.freeUsers?.map((user) => (
                    <div key={user.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-md relative bg-slate-50 dark:bg-slate-700/50">
                        <button type="button" onClick={() => handleRemoveUser(user.id)} className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            <div className="sm:col-span-2">
                                <label htmlFor={`user-fullName-${user.id}`} className="block text-xs font-medium text-slate-600 dark:text-slate-400">ФИО</label>
                                <input 
                                    type="text" 
                                    id={`user-fullName-${user.id}`}
                                    value={user.fullName} 
                                    onChange={(e) => handleUserChange(user.id, 'fullName', e.target.value)} 
                                    placeholder="Иванов Иван Иванович"
                                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200" 
                                />
                            </div>
                            <div>
                                <label htmlFor={`user-position-${user.id}`} className="block text-xs font-medium text-slate-600 dark:text-slate-400">Должность</label>
                                <input 
                                    type="text" 
                                    id={`user-position-${user.id}`}
                                    value={user.position || ''} 
                                    onChange={(e) => handleUserChange(user.id, 'position', e.target.value)} 
                                    placeholder="Менеджер"
                                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200" 
                                />
                            </div>
                            <div>
                                <label htmlFor={`user-phone-${user.id}`} className="block text-xs font-medium text-slate-600 dark:text-slate-400">Телефон</label>
                                <input 
                                    type="text" 
                                    id={`user-phone-${user.id}`}
                                    value={user.phone || ''} 
                                    onChange={(e) => handleUserChange(user.id, 'phone', e.target.value)} 
                                    placeholder="+7 (999) 123-45-67"
                                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200" 
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <button
                type="button"
                onClick={handleAddUser}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
                <PlusIcon className="w-4 h-4" />
                Добавить пользователя
            </button>
          </fieldset>
          
          <div>
            <label htmlFor="installationDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Дата установки</label>
            <input type="date" name="installationDate" id="installationDate" value={formData.installationDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Статус</label>
            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200">
              {Object.values(StationStatus).filter(s => s !== StationStatus.REMOVED).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Заметки</label>
            <textarea name="notes" id="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200"></textarea>
            <button
                type="button"
                onClick={handleGenerateNotes}
                disabled={isGenerating}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <SparklesIcon className="w-4 h-4" />
                {isGenerating ? 'Генерация...' : 'ИИ-помощник'}
            </button>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Отмена
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StationForm;
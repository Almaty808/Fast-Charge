
import React, { useState, useEffect, useRef } from 'react';
import { Station, StationStatus, User } from '../types';
import { generateInstallationNotes } from '../services/geminiService';
import { SparklesIcon, UsersIcon, CameraIcon, TrashIcon } from './Icons';

interface StationFormProps {
  station: Station | null;
  currentUserName: string;
  onSave: (station: Station) => void;
  onClose: () => void;
  allUsers?: User[];
  isAdmin?: boolean;
}

type FormData = Omit<Station, 'id' | 'history'>;

const StationForm: React.FC<StationFormProps> = ({ station, currentUserName, onSave, onClose, allUsers = [], isAdmin = false }) => {
  const [formData, setFormData] = useState<FormData>({
    locationName: '',
    address: '',
    installer: currentUserName,
    installationDate: new Date().toISOString().split('T')[0],
    status: StationStatus.PLANNED,
    notes: '',
    coordinates: null,
    sid: '',
    did: '',
    sim: '',
    freeUsers: [],
    photos: [],
    assignedUserId: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (station) {
      setFormData({
          ...station,
          sid: station.sid || '',
          did: station.did || '',
          sim: station.sim || '',
          freeUsers: station.freeUsers || [],
          photos: station.photos || [],
          assignedUserId: station.assignedUserId || '',
      });
    }
  }, [station]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationError) setValidationError(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = 3 - (formData.photos?.length || 0);
    const filesToProcess = Array.from(files).slice(0, remainingSlots) as File[];

    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), base64String]
        }));
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateNotes = async () => {
    if (!formData.locationName || !formData.address) {
      alert("Сначала укажите название и адрес.");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    const requiredFields: (keyof FormData)[] = ['locationName', 'address', 'sid', 'did', 'sim'];
    const missingFields = requiredFields.filter(field => !String(formData[field]).trim());

    if (missingFields.length > 0) {
      setValidationError('Пожалуйста, заполните все обязательные поля (отмечены *)');
      return;
    }

    onSave({
      id: station ? station.id : Date.now().toString(),
      ...formData,
      history: station?.history || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-0 md:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl md:rounded-[3.5rem] shadow-2xl h-full md:h-auto md:max-h-[90vh] flex flex-col animate-scale-in overflow-hidden border border-white/10">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {station ? 'Редактор объекта' : 'Новая станция'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Заполнение технических данных</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-rose-500 transition-all hover:rotate-90"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {validationError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest text-center animate-shake">
              {validationError}
            </div>
          )}

          <div className="space-y-6">
              <div className="group">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors group-focus-within:text-primary-600">
                    Название заведения <span className="text-rose-500">*</span>
                </label>
                <input type="text" name="locationName" value={formData.locationName} onChange={handleChange} required placeholder="Напр. Sky Bar Almaty" className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/15 text-slate-900 dark:text-white font-bold transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Адрес установки <span className="text-rose-500">*</span>
                </label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="пр. Аль-Фараби, 77..." className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/15 text-slate-900 dark:text-white font-bold transition-all" />
              </div>
          </div>

          {/* Technical Section */}
          <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 space-y-6">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Идентификаторы оборудования</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">SID <span className="text-rose-500">*</span></label>
                  <input type="text" name="sid" value={formData.sid} onChange={handleChange} required placeholder="ALM-001" className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-none rounded-xl focus:ring-4 focus:ring-primary-500/10 text-slate-900 dark:text-white font-black text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">DID <span className="text-rose-500">*</span></label>
                  <input type="text" name="did" value={formData.did} onChange={handleChange} required placeholder="ST-5520" className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-none rounded-xl focus:ring-4 focus:ring-primary-500/10 text-slate-900 dark:text-white font-black text-sm transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">SIM-Карта <span className="text-rose-500">*</span></label>
                  <input type="text" name="sim" value={formData.sim} onChange={handleChange} required placeholder="+7 (707) 000-00-00" className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-none rounded-xl focus:ring-4 focus:ring-primary-500/10 text-slate-900 dark:text-white font-black text-sm transition-all" />
                </div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Фотофиксация (макс. 3)</label>
            <div className="grid grid-cols-3 gap-4">
              {formData.photos?.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group/photo">
                  <img src={photo} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-xl opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-lg"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(formData.photos?.length || 0) < 3 && (
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50/10 transition-all group"
                >
                  <CameraIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Добавить</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              multiple 
              className="hidden" 
            />
          </div>

          {/* Ответственный сотрудник - только для Админа */}
          {isAdmin && (
              <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50">
                <label className="flex items-center gap-3 text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                    <UsersIcon className="w-4 h-4" />
                    Ответственный сотрудник
                </label>
                <div className="relative">
                  <select 
                      name="assignedUserId" 
                      value={formData.assignedUserId} 
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white dark:bg-slate-800 border-none rounded-2xl font-black text-sm text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                  >
                      <option value="">Без ответственного (свободный)</option>
                      {allUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} — {u.role}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-[10px] text-indigo-400 mt-4 font-bold uppercase tracking-wider opacity-80 leading-relaxed italic">
                    * Сотрудник получит персональное уведомление после сохранения.
                </p>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Статус</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-pointer">
                  {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Дата</label>
                <input type="date" name="installationDate" value={formData.installationDate} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200" />
              </div>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Заметки и инструкции</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={5} className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] text-sm text-slate-700 dark:text-slate-200 font-medium resize-none focus:ring-4 focus:ring-primary-500/15 transition-all" placeholder="Специфика монтажа, Wi-Fi, контактные лица..." />
            <button 
                type="button" 
                onClick={handleGenerateNotes} 
                disabled={isGenerating} 
                className="absolute bottom-5 right-5 flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
            >
                <SparklesIcon className="w-4 h-4" />
                {isGenerating ? 'Магия ИИ...' : 'AI Помощник'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 pb-safe">
          <div className="flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-all">Отмена</button>
              <button onClick={handleSubmit} className="flex-[2] py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-white bg-primary-600 shadow-2xl shadow-primary-500/40 hover:bg-primary-700 transition-all active:scale-[0.98]">Сохранить данные</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationForm;


import React, { useState, useEffect, useRef } from 'react';
import { Station, StationStatus, FreeUser, User } from '../types';
import { generateInstallationNotes } from '../services/geminiService';
import { SparklesIcon, PlusIcon, TrashIcon, CameraIcon, UsersIcon } from './Icons';

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
  };

  const handleGenerateNotes = async () => {
    if (!formData.locationName || !formData.address) {
      alert("Укажите название и адрес.");
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
    onSave({
      id: station ? station.id : Date.now().toString(),
      ...formData,
      history: station?.history || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[70] flex items-end md:items-center justify-center pt-safe">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg md:rounded-4xl shadow-2xl h-[95vh] md:h-auto md:max-h-[90vh] flex flex-col animate-mobile-form md:animate-slide-up overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {station ? 'Редактировать' : 'Новая станция'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-24 md:pb-6">
          <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Название места</label>
                <input type="text" name="locationName" value={formData.locationName} onChange={handleChange} required placeholder="ТРЦ..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/20 text-slate-900 dark:text-white font-medium" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Адрес</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Адрес..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/20 text-slate-900 dark:text-white font-medium" />
              </div>
          </div>

          {/* Admin Assignment Field */}
          {isAdmin && (
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-3xl border border-primary-100 dark:border-primary-800">
                <label className="flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest mb-3">
                    <UsersIcon className="w-4 h-4" />
                    Назначить установщика
                </label>
                <select 
                    name="assignedUserId" 
                    value={formData.assignedUserId} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl font-bold text-sm"
                >
                    <option value="">Не назначен</option>
                    {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <p className="text-[10px] text-primary-500 mt-2 font-medium">Пользователь получит уведомление о задаче.</p>
              </div>
          )}

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Статус</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold text-sm">
                  {Object.values(StationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Дата</label>
                <input type="date" name="installationDate" value={formData.installationDate} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold" />
              </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Фотоотчет</label>
            <div className="flex gap-3">
              {formData.photos?.map((photo, index) => (
                <div key={index} className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden border">
                  <img src={photo} className="h-full w-full object-cover" />
                </div>
              ))}
              {(formData.photos?.length || 0) < 3 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-400">
                  <CameraIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Фото</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Заметки</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm" placeholder="Особенности места..." />
            <button type="button" onClick={handleGenerateNotes} disabled={isGenerating} className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-wider">
                <SparklesIcon className="w-3 h-3" />
                {isGenerating ? 'ИИ...' : 'AI Помощник'}
            </button>
          </div>
        </form>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 pb-safe">
          <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-4 rounded-2xl font-bold text-sm text-slate-400 bg-slate-50 dark:bg-slate-800">Отмена</button>
              <button onClick={handleSubmit} className="flex-[2] py-4 rounded-2xl font-black text-sm text-white bg-primary-600 shadow-xl shadow-primary-500/30">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationForm;

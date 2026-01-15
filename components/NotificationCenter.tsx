
import React from 'react';
import { AppNotification } from '../types';
import { BellIcon, CheckIcon } from './Icons';

interface NotificationCenterProps {
    notifications: AppNotification[];
    onMarkAllAsRead: () => void;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAllAsRead, onClose }) => {
    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const getTypeStyles = (type: AppNotification['type']) => {
        switch (type) {
            case 'warning': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/30';
            case 'danger': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200/30';
            case 'success': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200/30';
            case 'assignment': return 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 border-primary-200/30';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200/30';
        }
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-scale-in origin-top-right">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-widest">
                    <BellIcon className="w-4 h-4 text-primary-500" />
                    Уведомления
                </h3>
                <button 
                    onClick={onMarkAllAsRead}
                    className="text-[10px] font-black text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 uppercase tracking-widest"
                >
                    <CheckIcon className="w-3 h-3" />
                    Прочитать все
                </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                {sortedNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BellIcon className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-400">У вас пока нет уведомлений</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {sortedNotifications.map((notif) => (
                            <li key={notif.id} className={`p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!notif.read ? 'bg-primary-50/20 dark:bg-primary-900/10' : ''}`}>
                                <div className="flex gap-4">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-transparent'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getTypeStyles(notif.type)}`}>
                                                {notif.type}
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-bold">
                                                {new Date(notif.timestamp).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                                            {notif.message}
                                        </p>
                                        <div className="mt-2 flex items-center justify-end">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                от {notif.author}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <button onClick={onClose} className="w-full py-3 bg-white dark:bg-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:bg-slate-100 transition-colors border border-slate-100 dark:border-slate-600">
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default NotificationCenter;

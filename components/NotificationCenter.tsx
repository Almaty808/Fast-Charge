
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

    const typeColors = {
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    };

    return (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-fade-in-up origin-top-right">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-primary-500" />
                    Уведомления
                </h3>
                <button 
                    onClick={onMarkAllAsRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                    <CheckIcon className="w-3 h-3" />
                    Прочитать все
                </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                {sortedNotifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        <p>У вас пока нет уведомлений</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {sortedNotifications.map((notif) => (
                            <li key={notif.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!notif.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                                <div className="flex gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary-500' : 'bg-transparent'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-tight">
                                            {notif.message}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500 dark:text-slate-500">
                                                {new Date(notif.timestamp).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
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
            <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                <button onClick={onClose} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1 w-full">
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default NotificationCenter;

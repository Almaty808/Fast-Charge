
import React, { useState } from 'react';
import { User, UserStatus, UserRole } from '../types';

interface AuthProps {
    onLogin: (user: User) => void;
    onRegister: (user: User) => void;
    users: User[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, users }) => {
    const [view, setView] = useState<'login' | 'register' | 'success'>('login');
    const [identifier, setIdentifier] = useState(''); // ID или Email
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [registeredId, setRegisteredId] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const cleanInput = identifier.replace(/\s+/g, '').toLowerCase();
        const cleanPassword = password.trim();

        if (!cleanInput || !cleanPassword) {
            setError('Введите логин и пароль');
            return;
        }

        const user = users.find(u => {
            const storedId = (u.loginId || '').replace(/\s+/g, '').toLowerCase();
            const storedEmail = (u.email || '').replace(/\s+/g, '').toLowerCase();
            return storedId === cleanInput || storedEmail === cleanInput;
        });

        if (!user) {
            setError(`Аккаунт "${identifier}" не найден. Проверьте данные или обратитесь к админу.`);
            return;
        }

        if (user.password !== cleanPassword) {
            setError('Неверный пароль. Попробуйте еще раз.');
            return;
        }

        if (user.status === UserStatus.PENDING) {
            setError('Ваш аккаунт еще не активирован администратором.');
            return;
        }

        onLogin(user);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const emailExists = users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (emailExists) {
            setError('Пользователь с таким Email уже существует');
            return;
        }
        
        const generatedId = 'FC-' + Math.random().toString(36).substring(2, 7).toUpperCase();

        const newUser: User = {
            id: 'u-' + Date.now(),
            loginId: generatedId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: '',
            password: password.trim(),
            status: UserStatus.PENDING,
            role: UserRole.USER,
        };

        onRegister(newUser);
        setRegisteredId(generatedId);
        setView('success');
    };

    if (view === 'success') {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 items-center justify-center p-6 animate-fade-in">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Заявка принята</h2>
                    <p className="text-slate-500 font-medium mb-8">Администратор рассмотрит ваш доступ. Запомните ваш персональный ID:</p>
                    <div className="bg-slate-50 dark:bg-slate-800 py-4 px-6 rounded-2xl mb-8 border-2 border-dashed border-primary-200">
                        <span className="text-3xl font-black text-primary-600 tracking-widest">{registeredId}</span>
                    </div>
                    <button 
                        onClick={() => setView('login')}
                        className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 active:scale-95 transition-all"
                    >
                        Вернуться ко входу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-safe pb-safe selection:bg-primary-100 selection:text-primary-700">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
                <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-primary-500/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] right-[-10%] w-[70%] h-[30%] bg-indigo-500/20 rounded-full blur-[120px]" />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex p-5 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] shadow-2xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Fast Charge</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Corporate Smart Network</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-white/10 animate-slide-up relative overflow-hidden">
                    {/* Header Tabs */}
                    <div className="flex gap-4 mb-10 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <button 
                            onClick={() => { setView('login'); setError(''); }}
                            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'login' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Вход
                        </button>
                        <button 
                            onClick={() => { setView('register'); setError(''); }}
                            className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'register' ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm shadow-black/5' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Регистрация
                        </button>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-tight text-center rounded-2xl animate-fade-in leading-relaxed">
                            {error}
                        </div>
                    )}

                    <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-6">
                        {view === 'login' ? (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID или Email</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Напр. ALIM-102"
                                        value={identifier}
                                        onChange={e => setIdentifier(e.target.value)}
                                        className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-base font-bold transition-all text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Полное имя</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Иванов Иван"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-base font-bold transition-all text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Рабочий Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="user@fastcharge.kz"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-base font-bold transition-all text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </>
                        )}
                        
                        <div className="relative space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Пароль</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-base font-bold transition-all text-slate-900 dark:text-white outline-none"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-[42px] text-[10px] font-black text-slate-400 hover:text-primary-500 uppercase tracking-widest transition-colors"
                            >
                                {showPassword ? 'Скрыть' : 'Показать'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-18 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/40 transition-all active:scale-95 mt-6 py-5"
                        >
                            {view === 'login' ? 'Войти в сеть' : 'Создать аккаунт'}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {view === 'login' ? 'Нет аккаунта? Зарегистрируйтесь выше' : 'Уже есть доступ? Авторизуйтесь выше'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

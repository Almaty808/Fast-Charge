
import React, { useState } from 'react';
import { User, UserStatus, UserRole } from '../types';
import { PhoneIcon } from './Icons';

interface AuthProps {
    onLogin: (user: User) => void;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const Auth: React.FC<AuthProps> = ({ onLogin, users, setUsers }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            onLogin(user);
        } else {
            setError('Неверный email или пароль.');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (users.some(u => u.email === email)) {
            setError('Пользователь с таким email уже существует.');
            return;
        }

        const newUser: User = {
            id: new Date().toISOString(),
            name,
            email,
            phone,
            password,
            status: UserStatus.PENDING,
            role: UserRole.USER,
        };

        setUsers(prevUsers => [...prevUsers, newUser]);
        alert('Регистрация прошла успешно! Ваша учетная запись ожидает подтверждения администратором.');
        setIsLoginView(true);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />

            <div className="w-full max-w-lg p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 relative z-10 animate-slide-up">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-3xl bg-primary-600 shadow-xl shadow-primary-500/30 mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                        Fast Charge
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-[11px]">Система управления активами</p>
                </div>
                
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8">
                    <button 
                        onClick={() => setIsLoginView(true)}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isLoginView ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        Вход
                    </button>
                    <button 
                        onClick={() => setIsLoginView(false)}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isLoginView ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        Регистрация
                    </button>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 text-sm font-bold text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 animate-shake">
                        {error}
                    </div>
                )}
                
                <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-5">
                    {!isLoginView && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Имя</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Иван"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="block w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/20 transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Телефон</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+7..."
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="block w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/20 transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium"
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="mail@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="block w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/20 transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Пароль</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="block w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/20 transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-5 px-6 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-xl shadow-primary-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
                    >
                        {isLoginView ? 'Войти в панель' : 'Создать аккаунт'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs font-medium text-slate-400">
                    © 2024 Fast Charge Enterprise Edition. Все права защищены.
                </p>
            </div>
        </div>
    );
};

export default Auth;


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
    const [phone, setPhone] = useState(''); // New state
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
            phone, // Use phone from state
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
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                        ChargeManager
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Система управления станциями</p>
                </div>
                
                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-200">
                    {isLoginView ? 'Вход в систему' : 'Создание аккаунта'}
                </h2>
                
                {error && (
                    <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 animate-shake">
                        {error}
                    </div>
                )}
                
                <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                    {!isLoginView && (
                        <>
                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1">Имя сотрудника</label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Александр Иванов"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1">Номер телефона</label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    placeholder="+7 (___) ___-__-__"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                />
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="email@company.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1">Пароль</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoginView ? 'Войти в панель' : 'Зарегистрироваться'}
                        </button>
                    </div>
                </form>

                <div className="text-sm text-center pt-2">
                    <button
                        onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
                        className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                    >
                        {isLoginView ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;

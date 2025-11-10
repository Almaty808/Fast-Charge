import React, { useState } from 'react';
import { User, UserStatus, UserRole } from '../types';

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
            password,
            status: UserStatus.PENDING,
            role: UserRole.USER,
        };

        setUsers(prevUsers => [...prevUsers, newUser]);
        alert('Регистрация прошла успешно! Ваша учетная запись ожидает подтверждения администратором.');
        setIsLoginView(true);
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-slate-800">
                <h1 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400">
                    Учет Зарядных Станций
                </h1>
                <h2 className="text-xl font-bold text-center text-slate-700 dark:text-slate-200">
                    {isLoginView ? 'Вход в систему' : 'Регистрация'}
                </h2>
                
                {error && <p className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md dark:bg-red-900/50 dark:text-red-300">{error}</p>}
                
                <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-6">
                    {!isLoginView && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Имя</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Пароль</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            {isLoginView ? 'Войти' : 'Зарегистрироваться'}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <button
                        onClick={() => { setIsLoginView(!isLoginView); setError(''); }}
                        className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                        {isLoginView ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;

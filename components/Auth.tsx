
import React, { useState } from 'react';
import { User, UserStatus, UserRole } from '../types';

interface AuthProps {
    onLogin: (user: User) => void;
    onRegister: (user: User) => void;
    users: User[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, users }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [loginIdInput, setLoginIdInput] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Агрессивная нормализация ввода: убираем ВСЕ пробелы и в нижний регистр
        const searchInput = loginIdInput.replace(/\s+/g, '').toLowerCase();
        const searchPassword = password.trim();

        if (!searchInput || !searchPassword) {
            setError('Введите ID и пароль');
            return;
        }

        // Поиск пользователя: проверяем и loginId, и email с нормализацией
        const user = users.find(u => {
            const storedId = (u.loginId || '').replace(/\s+/g, '').toLowerCase();
            const storedEmail = (u.email || '').replace(/\s+/g, '').toLowerCase();
            return storedId === searchInput || storedEmail === searchInput;
        });

        if (!user) {
            setError(`СОТРУДНИК С ID "${loginIdInput}" НЕ НАЙДЕН. ПРОВЕРЬТЕ ПРАВИЛЬНОСТЬ ID ИЛИ ОБРАТИТЕСЬ К АДМИНИСТРАТОРУ.`);
            return;
        }

        if (user.password !== searchPassword) {
            setError('НЕВЕРНЫЙ ПАРОЛЬ. ПРОВЕРЬТЕ РАСКЛАДКУ И CAPS LOCK.');
            return;
        }

        if (user.status === UserStatus.PENDING) {
            setError('ВАШ АККАУНТ ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ АДМИНИСТРАТОРОМ.');
            return;
        }

        onLogin(user);
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
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
        alert(`ЗАЯВКА ОТПРАВЛЕНА. ВАШ БУДУЩИЙ ID: ${generatedId}`);
        setIsLoginView(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-safe pb-safe">
            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 py-12">
                <div className="text-center mb-10">
                    <div className="inline-flex p-5 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2rem] shadow-2xl mb-6 animate-scale-in">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 uppercase">Fast Charge</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Internal Access System</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-slate-100 dark:border-slate-800 animate-slide-up">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 uppercase">
                        {isLoginView ? 'Авторизация' : 'Регистрация'}
                    </h2>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-black uppercase tracking-tight text-center rounded-2xl animate-fade-in leading-relaxed">
                            {error}
                        </div>
                    )}

                    <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-5">
                        {isLoginView ? (
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">User ID</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ALIM-102"
                                    value={loginIdInput}
                                    onChange={e => setLoginIdInput(e.target.value)}
                                    className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-base font-bold transition-all text-slate-900 dark:text-white outline-none"
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="ФИО сотрудника"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-bold focus:ring-4 focus:ring-primary-500/15 outline-none text-slate-900 dark:text-white"
                                />
                                <input
                                    type="email"
                                    required
                                    placeholder="Рабочий Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl text-base font-bold focus:ring-4 focus:ring-primary-500/15 outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                        )}
                        
                        <div className="relative space-y-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Пароль</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-base font-bold transition-all text-slate-900 dark:text-white outline-none"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-[54px] -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                            >
                                {showPassword ? 'Скрыть' : 'Показать'}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-95 mt-4"
                        >
                            {isLoginView ? 'Войти в систему' : 'Отправить данные'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
                        <button 
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:opacity-70 transition-opacity"
                        >
                            {isLoginView ? 'Запросить доступ у админа' : 'Уже есть аккаунт? Войти'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

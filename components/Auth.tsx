
import React, { useState, useEffect } from 'react';
import { User, UserStatus, UserRole } from '../types';

interface AuthProps {
    onLogin: (user: User) => void;
    onRegister: (user: User) => void;
    users: User[];
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister, users }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isInvited, setIsInvited] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const inviteCode = params.get('invite');
        if (inviteCode) {
            try {
                const decodedEmail = atob(inviteCode);
                setEmail(decodedEmail.toLowerCase().trim());
                setIsLoginView(false);
                setIsInvited(true);
            } catch (e) {
                console.error("Invalid invite code");
            }
        }
    }, []);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const searchEmail = email.toLowerCase().trim();
        const searchPassword = password.trim();

        const user = users.find(u => 
            u.email.toLowerCase().trim() === searchEmail
        );

        if (!user) {
            setError('Пользователь с таким Email не найден.');
            return;
        }

        if (user.password !== searchPassword) {
            setError('Неверный пароль. Пожалуйста, проверьте раскладку и регистр.');
            return;
        }

        if (user.status === UserStatus.PENDING) {
            setError('Ваш аккаунт еще не подтвержден администратором.');
            return;
        }

        onLogin(user);
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const normalizedEmail = email.toLowerCase().trim();

        if (users.some(u => u.email.toLowerCase().trim() === normalizedEmail)) {
            setError('Эта почта уже зарегистрирована.');
            return;
        }

        const newUser: User = {
            id: 'u-' + Math.random().toString(36).substring(2, 9),
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password: password,
            status: UserStatus.PENDING,
            role: UserRole.USER,
        };

        onRegister(newUser);
        alert('Заявка на регистрацию отправлена. Администратор подтвердит ваш доступ в ближайшее время.');
        setIsLoginView(true);
        setIsInvited(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-6 py-12 relative overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            <div className="w-full max-w-[480px] relative z-10 animate-slide-up">
                <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] p-10 md:p-14 border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col items-center mb-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/40 mb-8 transform hover:scale-105 transition-transform duration-500">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Fast Charge</h1>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Smart Network Solutions</p>
                    </div>

                    {isInvited && !isLoginView && (
                        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl text-primary-600 dark:text-primary-300 text-xs font-bold text-center animate-fade-in">
                            ✨ Вы приглашены в команду!
                        </div>
                    )}

                    {error && (
                        <div className="mb-8 p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold text-center rounded-[1.5rem] animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                        {!isLoginView && (
                            <div className="grid grid-cols-1 gap-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Ваше имя"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white"
                                />
                                <input
                                    type="tel"
                                    placeholder="Контактный телефон"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white"
                                />
                            </div>
                        )}
                        <input
                            type="email"
                            required
                            readOnly={isInvited && !isLoginView}
                            placeholder="Email адрес"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={`w-full px-6 py-5 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white ${isInvited && !isLoginView ? 'bg-slate-100 dark:bg-slate-700 cursor-not-allowed opacity-70' : 'bg-slate-50 dark:bg-slate-800'}`}
                        />
                        <input
                            type="password"
                            required
                            placeholder="Пароль"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl text-sm font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white"
                        />

                        <button
                            type="submit"
                            className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-[0.97] mt-6"
                        >
                            {isLoginView ? 'Войти в систему' : 'Отправить заявку'}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-slate-50 dark:border-slate-800 flex flex-col items-center gap-5">
                        <button 
                            onClick={() => { setIsLoginView(!isLoginView); if(isLoginView) setIsInvited(false); }}
                            className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                        >
                            {isLoginView ? 'Ещё нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

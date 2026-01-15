
import React, { useState, useEffect } from 'react';
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
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const searchId = loginIdInput.toLowerCase().trim();
        const searchPassword = password; 

        // Ищем пользователя по логину (loginId)
        const user = users.find(u => 
            u.loginId.toLowerCase().trim() === searchId
        );

        if (!user) {
            setError('Сотрудник с таким ID не найден. Обратитесь к админу.');
            return;
        }

        if (user.password !== searchPassword) {
            setError('Неверный пароль. Проверьте раскладку клавиатуры.');
            return;
        }

        if (user.status === UserStatus.PENDING) {
            setError('Аккаунт еще не активирован администратором.');
            return;
        }

        onLogin(user);
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Регистрация теперь тоже генерирует временный loginId или использует имя
        const tempLoginId = 'USER-' + Math.random().toString(36).substring(2, 6).toUpperCase();

        const newUser: User = {
            id: 'u-' + Math.random().toString(36).substring(2, 9),
            loginId: tempLoginId,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: password,
            status: UserStatus.PENDING,
            role: UserRole.USER,
        };

        onRegister(newUser);
        alert(`Заявка отправлена! Если админ одобрит, ваш ID для входа будет: ${tempLoginId}`);
        setIsLoginView(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-safe pb-safe selection:bg-primary-100 selection:text-primary-700">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-primary-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-5%] right-[-10%] w-[70%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 py-12">
                <div className="text-center mb-10">
                    <div className="inline-flex p-5 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2rem] shadow-2xl shadow-primary-500/30 mb-6 animate-scale-in">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Fast Charge</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Internal Network Access</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 md:p-10 border border-slate-100 dark:border-slate-800 animate-slide-up">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8">
                        {isLoginView ? 'Вход в систему' : 'Запрос доступа'}
                    </h2>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-widest text-center rounded-2xl animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={isLoginView ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
                        {isLoginView ? (
                            <input
                                type="text"
                                required
                                placeholder="ID сотрудника (напр. admin-808)"
                                value={loginIdInput}
                                onChange={e => setLoginIdInput(e.target.value)}
                                className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white"
                            />
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Ваше ФИО"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white"
                                />
                                <input
                                    type="email"
                                    required
                                    placeholder="Email для связи"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white"
                                />
                            </div>
                        )}
                        
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Пароль"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-16 px-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-base font-bold focus:ring-4 focus:ring-primary-500/15 transition-all text-slate-900 dark:text-white"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                {showPassword ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.888 9.888L3 3m18 18l-6.888-6.888" /></svg>
                                )}
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-[0.97] mt-4"
                        >
                            {isLoginView ? 'Войти' : 'Отправить запрос'}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
                        <button 
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest"
                        >
                            {isLoginView ? 'Нужен доступ?' : 'Вернуться ко входу'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;

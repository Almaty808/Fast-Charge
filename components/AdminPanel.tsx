import React from 'react';
import { User, UserStatus, UserRole } from '../types';

interface AdminPanelProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    onBack: () => void;
}

const UserStatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const colors = {
        [UserStatus.APPROVED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [UserStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
}

const UserRoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
    const colors = {
        [UserRole.ADMIN]: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
        [UserRole.USER]: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[role]}`}>{role}</span>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ users, setUsers, onBack }) => {

    const handleUpdateUser = (id: string, updates: Partial<User>) => {
        setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const handleDeleteUser = (id: string) => {
        if(users.find(u => u.id === id)?.role === UserRole.ADMIN && users.filter(u => u.role === UserRole.ADMIN).length <= 1) {
            alert('Нельзя удалить последнего администратора.');
            return;
        }
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <header className="bg-white dark:bg-slate-800 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Управление пользователями</h1>
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                        Назад к приложению
                    </button>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Имя</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Статус</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Роль</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><UserStatusBadge status={user.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><UserRoleBadge role={user.role} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {user.status === UserStatus.PENDING && (
                                            <button onClick={() => handleUpdateUser(user.id, { status: UserStatus.APPROVED })} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Подтвердить</button>
                                        )}
                                        {user.role === UserRole.USER && (
                                            <button onClick={() => handleUpdateUser(user.id, { role: UserRole.ADMIN })} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">Сделать админом</button>
                                        )}
                                        {user.role === UserRole.ADMIN && (
                                            <button onClick={() => handleUpdateUser(user.id, { role: UserRole.USER })} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={users.filter(u => u.role === UserRole.ADMIN).length <= 1}>Снять админа</button>
                                        )}
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Удалить</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;

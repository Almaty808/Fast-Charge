
export enum StationStatus {
  PLANNED = 'Запланировано',
  INSTALLED = 'Установлено',
  MAINTENANCE = 'Обслуживание',
  REMOVED = 'Удалено',
}

export interface FreeUser {
  id: string;
  fullName: string;
  position?: string;
  phone?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  employee: string;
  change: string;
}

export interface Station {
  id: string;
  locationName: string;
  address: string;
  installer: string;
  installationDate: string;
  status: StationStatus;
  notes: string;
  coordinates: { lat: number; lng: number } | null;
  sid?: string;
  did?: string;
  sim?: string;
  freeUsers?: FreeUser[];
  history: HistoryEntry[];
  photos?: string[];
  assignedUserId?: string; // ID назначенного сотрудника
}

export enum UserStatus {
  PENDING = 'Ожидание',
  APPROVED = 'Подтвержден',
}

export enum UserRole {
  USER = 'Пользователь',
  ADMIN = 'Администратор',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  status: UserStatus;
  role: UserRole;
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  author: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'danger' | 'push' | 'email' | 'assignment';
  targetUserId?: string; // Для кого уведомление (null если для всех админов)
}

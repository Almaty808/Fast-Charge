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
  freeUsers?: FreeUser[];
}
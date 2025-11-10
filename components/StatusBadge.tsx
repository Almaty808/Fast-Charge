
import React from 'react';
import { StationStatus } from '../types';

interface StatusBadgeProps {
  status: StationStatus;
}

const statusColors: Record<StationStatus, string> = {
  [StationStatus.PLANNED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [StationStatus.INSTALLED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [StationStatus.MAINTENANCE]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [StationStatus.REMOVED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;

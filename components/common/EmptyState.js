import { UserCircleIcon, UserIcon } from '@heroicons/react/20/solid';
import { UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';
import React from 'react';

const EmptyState = ({ message, Icon, width }) => (
    <div className={`flex flex-col items-center justify-center rounded-lg shadow p-4 border ${width}`}>

        {Icon && <Icon className="w-12 h-12 text-gray-300" />}

        <p className="mt-1 text-sm text-gray-400 font-semibold">{message}</p>
    </div >
);

export default EmptyState;

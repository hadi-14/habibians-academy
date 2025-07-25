import React from 'react';
import { X } from 'lucide-react';

interface MessageAlertProps {
    type: 'error' | 'success';
    message: string;
    onClose: () => void;
}

export const MessageAlert: React.FC<MessageAlertProps> = ({ type, message, onClose }) => (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        'bg-green-100 text-green-800 border border-green-200'
        }`}>
        <div className="flex items-center gap-2">
            <span>{message}</span>
            <button onClick={onClose} className="ml-2">
                <X className="w-4 h-4" />
            </button>
        </div>
    </div>
);
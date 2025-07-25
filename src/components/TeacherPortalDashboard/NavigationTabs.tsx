import React from 'react';
import { BookOpen, FileText, Settings, Megaphone, Video } from 'lucide-react';

interface NavigationTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    assignmentsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab, assignmentsCount }) => {
    return (
        <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2 px-2 py-2 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg mx-auto relative w-full">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'dashboard'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105 border-2 border-blue-400'
                            : 'bg-white/60 text-gray-700 hover:bg-blue-50/80 border border-transparent'}
                        `}
                    style={{ boxShadow: activeTab === 'dashboard' ? '0 4px 24px 0 rgba(59,130,246,0.15)' : undefined }}
                >
                    <BookOpen className="w-5 h-5 inline mr-2" />
                    Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'assignments'
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-xl scale-105 border-2 border-green-400'
                            : 'bg-white/60 text-gray-700 hover:bg-green-50/80 border border-transparent'}
                        `}
                    style={{ boxShadow: activeTab === 'assignments' ? '0 4px 24px 0 rgba(16,185,129,0.15)' : undefined }}
                >
                    <FileText className="w-5 h-5 inline mr-2" />
                    Assignments ({assignmentsCount})
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'settings'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-xl scale-105 border-2 border-yellow-400'
                            : 'bg-white/60 text-gray-700 hover:bg-yellow-50/80 border border-transparent'}
                        `}
                    style={{ boxShadow: activeTab === 'settings' ? '0 4px 24px 0 rgba(251,191,36,0.15)' : undefined }}
                >
                    <Settings className="w-5 h-5 inline mr-2" />
                    Settings
                </button>
                <button
                    onClick={() => setActiveTab('stream')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'stream'
                            ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-xl scale-105 border-2 border-blue-400'
                            : 'bg-white/60 text-gray-700 hover:bg-blue-50/80 border border-transparent'}
                        `}
                    style={{ boxShadow: activeTab === 'stream' ? '0 4px 24px 0 rgba(59,130,246,0.15)' : undefined }}
                >
                    <Megaphone className="w-5 h-5 inline mr-2" />
                    Stream
                </button>
                <button
                    onClick={() => setActiveTab('meet')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === 'meet'
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-xl scale-105 border-2 border-red-400'
                            : 'bg-white/60 text-gray-700 hover:bg-red-50/80 border border-transparent'}
                        `}
                    style={{ boxShadow: activeTab === 'meet' ? '0 4px 24px 0 rgba(251,191,36,0.15)' : undefined }}
                >
                    <Video className="w-5 h-5 inline mr-2" />
                    Meet
                </button>
            </div>
        </div>
    );
};
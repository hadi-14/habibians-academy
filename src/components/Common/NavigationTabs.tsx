import React, { useEffect } from 'react';

export interface NavigationTabOption {
    key: string;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
}

interface NavigationTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    tabs: NavigationTabOption[];
    initializeFromHash?: boolean; // New prop to control hash initialization
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ 
    activeTab, 
    setActiveTab, 
    tabs, 
    initializeFromHash = false 
}) => {
    // Update URL hash when active tab changes
    useEffect(() => {
        if (activeTab) {
            window.history.replaceState(null, '', `#${activeTab}`);
        }
    }, [activeTab]);

    // Initialize from URL hash only if explicitly requested
    useEffect(() => {
        if (!initializeFromHash) return;
        
        const hash = window.location.hash.slice(1); // Remove the # symbol
        if (hash && tabs.some(tab => tab.key === hash)) {
            setActiveTab(hash);
        }
    }, [initializeFromHash, tabs, setActiveTab]);

    const handleTabClick = (tabKey: string) => {
        setActiveTab(tabKey);
    };

    return (
        <div className="flex justify-center mb-8">
            <div className="flex flex-wrap gap-2 px-2 py-2 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg mx-auto relative w-full">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabClick(tab.key)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 text-base focus:outline-none
                            ${activeTab === tab.key
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105 border-2 border-blue-400'
                                : 'bg-white/60 text-gray-700 hover:bg-blue-50/80 border border-transparent'}
                        `}
                        style={{ boxShadow: activeTab === tab.key ? '0 4px 24px 0 rgba(59,130,246,0.15)' : undefined }}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge !== undefined && (
                            <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">{tab.badge}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
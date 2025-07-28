import React from 'react';
import type { Student, Teacher } from '@/firebase/definitions';

interface HeroSectionProps {
    user: Teacher | Student;
    onLogout: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ user, onLogout }) => {
    return (
        <section className="relative h-32 md:h-40 flex items-center justify-center overflow-hidden mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 flex items-center justify-between w-full max-w-7xl px-6 mx-auto">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-3 border-white/90 overflow-hidden shadow-xl backdrop-blur-sm">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'TP'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                            Welcome Back{user.name ? `, ${user.name}` : ''}!
                        </h1>
                        <p className="text-white/90 text-sm">{'enrolledClasses' in user ? 'Student' : 'Teacher'} Portal Dashboard</p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="px-6 py-2 bg-white/20 backdrop-blur-md text-white font-medium rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg text-sm"
                >
                    Logout
                </button>
            </div>
        </section>
    );
};
// components/TeacherPortalDashboard/SettingsContent.tsx
import React from 'react';
import { FileText, Users, Settings } from 'lucide-react';
import type { Student, Teacher } from '@/firebase/definitions';

interface SettingsContentProps {
    user: Teacher | Student;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({ user }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={user.name || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={user.email || ''}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                readOnly
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Email Notifications</h4>
                                <p className="text-sm text-gray-600">Receive email notifications for new submissions</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Assignment Reminders</h4>
                                <p className="text-sm text-gray-600">Send reminders before assignment due dates</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800">Weekly Reports</h4>
                                <p className="text-sm text-gray-600">Receive weekly class performance reports</p>
                            </div>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                            <h4 className="font-medium text-gray-800">Export Data</h4>
                            <p className="text-sm text-gray-600">Download class and assignment data</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Users className="w-6 h-6 text-green-600" />
                        <div className="text-left">
                            <h4 className="font-medium text-gray-800">Bulk Import</h4>
                            <p className="text-sm text-gray-600">Import student data from CSV</p>
                        </div>
                    </button>
                    <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Settings className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                            <h4 className="font-medium text-gray-800">Advanced Settings</h4>
                            <p className="text-sm text-gray-600">Configure grading and policies</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
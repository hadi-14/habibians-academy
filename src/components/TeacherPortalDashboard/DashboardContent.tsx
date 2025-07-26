import React from 'react';
import { Megaphone, Users, FileText, GraduationCap, Star } from 'lucide-react';
import type { Class, Assignment } from '@/firebase/teacher-portal';

interface DashboardContentProps {
    classes: Class[];
    assignments: Assignment[];
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ classes, assignments }) => {
    const pendingAssignmentsCount = assignments.filter(a => a.status === 'active').length;
    const studentsReached = classes.reduce((sum, cls) => sum + (cls.students ?? 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Total Posts</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">0</p> {/* Placeholder */}
                        </div>
                        <Megaphone className="w-12 h-12 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Active Classes</h3>
                            <p className="text-3xl font-bold text-green-600 mt-2">{classes.length}</p>
                        </div>
                        <Users className="w-12 h-12 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Pending Assignments</h3>
                            <p className="text-3xl font-bold text-purple-600 mt-2">
                                {pendingAssignmentsCount}
                            </p>
                        </div>
                        <FileText className="w-12 h-12 text-purple-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Students Reached</h3>
                            <p className="text-3xl font-bold text-orange-600 mt-2">
                                {studentsReached}
                            </p>
                        </div>
                        <GraduationCap className="w-12 h-12 text-orange-500" />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Assignments</h3>
                    <div className="space-y-3">
                        {assignments.slice(0, 4).map(assignment => {
                            const assignmentClass = classes.find(cls => String(cls.uid) === assignment.classId) || { name: 'Unknown Class', students: 0 };
                            return (
                                <div key={assignment.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                                            {assignment.priority === 'high' && (
                                                <Star className="w-4 h-4 text-red-500 fill-current" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{assignmentClass.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{assignment.submissions}/{assignmentClass.students}</p>
                                        <p className="text-xs text-gray-500">submissions</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Class Performance</h3>
                    <div className="space-y-3">
                        {classes.slice(0, 4).map(cls => (
                            <div key={String(cls.uid)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{cls.name}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">{cls.students} students</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
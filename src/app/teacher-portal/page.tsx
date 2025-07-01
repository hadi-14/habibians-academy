'use client';
import React, { useState } from 'react';
import { Calendar, Users, BookOpen, Plus, Edit, Trash2, Clock, User, GraduationCap, FileText, Settings } from 'lucide-react';

export default function TeacherPortalDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Math Quiz Chapter 5",
      subject: "Mathematics",
      class: "Grade 10A",
      dueDate: "2025-07-15",
      status: "active",
      submissions: 23,
      totalStudents: 30
    },
    {
      id: 2,
      title: "Science Lab Report",
      subject: "Physics",
      class: "Grade 11B",
      dueDate: "2025-07-20",
      status: "active",
      submissions: 18,
      totalStudents: 25
    }
  ]);

  const [classes, setClasses] = useState([
    {
      id: 1,
      name: "Grade 10A - Mathematics",
      subject: "Mathematics",
      students: 30,
      schedule: "Mon, Wed, Fri - 9:00 AM",
      room: "Room 101"
    },
    {
      id: 2,
      name: "Grade 11B - Physics",
      subject: "Physics",
      students: 25,
      schedule: "Tue, Thu - 10:30 AM",
      room: "Lab 203"
    }
  ]);

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    class: '',
    description: '',
    dueDate: '',
    points: ''
  });

  const [newClass, setNewClass] = useState({
    name: '',
    subject: '',
    schedule: '',
    room: '',
    description: ''
  });

  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.subject || !newAssignment.class || !newAssignment.dueDate) return;
    const assignment = {
      id: assignments.length + 1,
      ...newAssignment,
      status: 'active',
      submissions: 0,
      totalStudents: 30
    };
    setAssignments([...assignments, assignment]);
    setNewAssignment({ title: '', subject: '', class: '', description: '', dueDate: '', points: '' });
    setShowAssignmentForm(false);
  };

  const handleCreateClass = () => {
    if (!newClass.name || !newClass.subject || !newClass.schedule || !newClass.room) return;
    const classItem = {
      id: classes.length + 1,
      ...newClass,
      students: 0
    };
    setClasses([...classes, classItem]);
    setNewClass({ name: '', subject: '', schedule: '', room: '', description: '' });
    setShowClassForm(false);
  };

  const deleteAssignment = (id) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const deleteClass = (id) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Classes</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{classes.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Active Assignments</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{assignments.length}</p>
            </div>
            <FileText className="w-12 h-12 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Students</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {classes.reduce((sum, cls) => sum + cls.students, 0)}
              </p>
            </div>
            <GraduationCap className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Assignments</h3>
          <div className="space-y-3">
            {assignments.slice(0, 3).map(assignment => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">{assignment.class}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{assignment.submissions}/{assignment.totalStudents}</p>
                  <p className="text-xs text-gray-500">submissions</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Classes</h3>
          <div className="space-y-3">
            {classes.slice(0, 3).map(cls => (
              <div key={cls.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-800">{cls.name}</h4>
                  <p className="text-sm text-gray-600">{cls.schedule}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{cls.room}</p>
                  <p className="text-xs text-gray-500">{cls.students} students</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Assignments</h2>
        <button
          onClick={() => setShowAssignmentForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {showAssignmentForm && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Assignment</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Assignment Title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <select
                value={newAssignment.subject}
                onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newAssignment.class}
                onChange={(e) => setNewAssignment({...newAssignment, class: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Class</option>
                <option value="Grade 10A">Grade 10A</option>
                <option value="Grade 10B">Grade 10B</option>
                <option value="Grade 11A">Grade 11A</option>
                <option value="Grade 11B">Grade 11B</option>
              </select>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <textarea
              placeholder="Assignment Description"
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
            <input
              type="number"
              placeholder="Points"
              value={newAssignment.points}
              onChange={(e) => setNewAssignment({...newAssignment, points: e.target.value})}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateAssignment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Assignment
              </button>
              <button
                onClick={() => setShowAssignmentForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {assignments.map(assignment => (
          <div key={assignment.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                <p className="text-gray-600 mt-1">{assignment.subject} • {assignment.class}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Due: {assignment.dueDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {assignment.submissions}/{assignment.totalStudents} submitted
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteAssignment(assignment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClasses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Classes</h2>
        <button
          onClick={() => setShowClassForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {showClassForm && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Class</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Class Name"
                value={newClass.name}
                onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <select
                value={newClass.subject}
                onChange={(e) => setNewClass({...newClass, subject: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Schedule (e.g., Mon, Wed, Fri - 9:00 AM)"
                value={newClass.schedule}
                onChange={(e) => setNewClass({...newClass, schedule: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Room Number"
                value={newClass.room}
                onChange={(e) => setNewClass({...newClass, room: e.target.value})}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <textarea
              placeholder="Class Description"
              value={newClass.description}
              onChange={(e) => setNewClass({...newClass, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateClass}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Class
              </button>
              <button
                onClick={() => setShowClassForm(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{cls.name}</h3>
                <p className="text-gray-600 mt-1">{cls.subject}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {cls.schedule}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {cls.students} students
                  </span>
                  <span>{cls.room}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteClass(cls.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Teacher Portal</h1>
          <p className="text-gray-600">Manage your classes, assignments, and students</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'assignments'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'classes'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Classes
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        <div className="mb-8">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'assignments' && renderAssignments()}
          {activeTab === 'classes' && renderClasses()}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Settings</h2>
              <p className="text-gray-600">Settings and preferences will be available here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
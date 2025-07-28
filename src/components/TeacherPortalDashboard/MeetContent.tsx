import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Users, ExternalLink } from 'lucide-react';
import type { Class, Meeting } from '@/firebase/definitions';
import { getMeetings } from '@/firebase/functions';
import { db } from '@/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface MeetContentProps {
    classes: Class[];
    setSuccess: (msg: string) => void;
}

export const MeetContent: React.FC<MeetContentProps> = ({ classes, setSuccess }) => {
    const [meetingLinkInput, setMeetingLinkInput] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [scheduleTitle, setScheduleTitle] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);

    useEffect(() => {
        getMeetings(db).then(meetings => {
            // Only show meetings scheduled for future (now or later)
            const now = new Date();
            const filtered = meetings.filter(m => m.time?.toDate && m.time.toDate() >= now);
            // Sort by time ascending
            filtered.sort((a, b) => a.time.toDate().getTime() - b.time.toDate().getTime());
            setUpcomingMeetings(filtered);
        }).catch(() => setUpcomingMeetings([]));
    }, []);

    const handleStartInstantMeeting = async () => {
        if (!meetingLinkInput.trim() || !selectedClassId) {
            alert("Please enter a meeting link and select a class.");
            return;
        }
        // Save meeting to Firestore
        await addDoc(collection(db, 'meetings'), {
            title: 'Instant Meeting',
            link: meetingLinkInput,
            classId: selectedClassId,
            time: serverTimestamp(),
            createdAt: serverTimestamp(),
            description: '',
            CreatedBy: '', // Optionally set teacherId if available
        });
        window.open(meetingLinkInput, '_blank');
        setMeetingLinkInput('');
        setSelectedClassId('');
        setSuccess("Meeting started and saved! Link opened in a new tab.");
    };

    const handleScheduleMeeting = async () => {
        if (!scheduleTitle.trim() || !selectedClassId || !scheduleTime) {
            alert("Please fill all fields for scheduling a meeting.");
            return;
        }
        await addDoc(collection(db, 'meetings'), {
            title: scheduleTitle,
            link: '',
            classId: selectedClassId,
            time: new Date(scheduleTime),
            createdAt: serverTimestamp(),
            description: '',
            CreatedBy: '', // Optionally set teacherId if available
        });
        setScheduleTitle('');
        setScheduleTime('');
        setSelectedClassId('');
        setSuccess("Meeting scheduled and saved!");
    };

    const formatMeetingTime = (meeting: Meeting) => {
        if (!meeting.time?.toDate) return '';
        const date = meeting.time.toDate();
        const now = new Date();
        const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffInHours < 48) {
            return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString([], { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getClassNameById = (classId: string) => {
        const foundClass = classes.find(cls => String(cls.uid) === classId);
        return foundClass?.name || 'Unknown Class';
    };

    const getTimeUntilMeeting = (meeting: Meeting) => {
        if (!meeting.time?.toDate) return '';
        const now = new Date();
        const meetingTime = meeting.time.toDate();
        const diffInMinutes = Math.floor((meetingTime.getTime() - now.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return diffInMinutes <= 0 ? 'Starting now' : `in ${diffInMinutes}m`;
        } else if (diffInMinutes < 1440) { // Less than 24 hours
            const hours = Math.floor(diffInMinutes / 60);
            return `in ${hours}h`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `in ${days}d`;
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Google Meet Integration</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Start Instant Meeting</h3>
                    <p className="text-gray-600 mb-4">Paste your meeting link (Google Meet, Zoom, Teams, etc.)</p>
                    <input
                        type="url"
                        placeholder="Paste meeting link here"
                        value={meetingLinkInput}
                        onChange={e => setMeetingLinkInput(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg mb-4"
                    />
                    <select
                        className="w-full px-3 py-2 border rounded-lg mb-4"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                            <option key={String(cls.uid)} value={String(cls.uid)}>{cls.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleStartInstantMeeting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Video className="w-5 h-5" />
                        Start Meeting
                    </button>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Schedule Meeting</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Meeting title"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={scheduleTitle}
                            onChange={e => setScheduleTitle(e.target.value)}
                        />
                        <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={selectedClassId}
                            onChange={e => setSelectedClassId(e.target.value)}
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={String(cls.uid)} value={String(cls.uid)}>{cls.name}</option>
                            ))}
                        </select>
                        <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={scheduleTime}
                            onChange={e => setScheduleTime(e.target.value)}
                        />
                        <button
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg"
                            onClick={handleScheduleMeeting}
                        >
                            Schedule Meeting
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Enhanced Upcoming Meetings Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-800">Upcoming Meetings</h3>
                    {upcomingMeetings.length > 0 && (
                        <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {upcomingMeetings.length} meeting{upcomingMeetings.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                
                {upcomingMeetings.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-500 mb-2">No upcoming meetings</h4>
                        <p className="text-gray-400">Schedule a meeting to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingMeetings.map((meeting) => {
                            const timeUntil = getTimeUntilMeeting(meeting);
                            const isStartingSoon = timeUntil.includes('m') && parseInt(timeUntil) <= 15;
                            
                            return (
                                <div 
                                    key={meeting.uid} 
                                    className={`relative border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${
                                        isStartingSoon 
                                            ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' 
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {isStartingSoon && (
                                        <div className="absolute -top-2 -right-2">
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                                SOON
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3">
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                                                    isStartingSoon ? 'bg-green-500' : 'bg-blue-500'
                                                }`}>
                                                    <Video className="w-6 h-6 text-white" />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                                                        {meeting.title}
                                                    </h4>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            <span className="font-medium">{getClassNameById(meeting.classId)}</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{formatMeetingTime(meeting)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {meeting.description && (
                                                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                                                            {meeting.description}
                                                        </p>
                                                    )}
                                                    
                                                    {meeting.link && (
                                                        <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                            <span className="truncate font-mono">{meeting.link}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2 ml-4">
                                            {timeUntil && (
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                    isStartingSoon 
                                                        ? 'bg-red-100 text-red-700' 
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}>
                                                    {timeUntil}
                                                </span>
                                            )}
                                            
                                            {meeting.link && (
                                                <a
                                                    href={meeting.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                        isStartingSoon
                                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    }`}
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Join
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
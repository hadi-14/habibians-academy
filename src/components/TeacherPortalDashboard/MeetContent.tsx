import React, { useState } from 'react';
import { Video } from 'lucide-react';
import type { Class } from '@/firebase/teacher-portal';

interface MeetContentProps {
    classes: Class[];
    setSuccess: (msg: string) => void;
}

export const MeetContent: React.FC<MeetContentProps> = ({ classes, setSuccess }) => {
    const [meetingLinkInput, setMeetingLinkInput] = useState('');

    const handleStartInstantMeeting = () => {
        if (!meetingLinkInput.trim()) {
            alert("Please enter a meeting link.");
            return;
        }
        window.open(meetingLinkInput, '_blank');
        // Placeholder for adding to posts stream if needed
        // const newMeetPost = {
        //     id: Date.now().toString(),
        //     title: 'Live Class Started',
        //     content: `Join the live class: ${meetingLinkInput}`,
        //     type: 'announcement',
        //     createdAt: new Date().toLocaleString(),
        //     targetClasses: classes.map(c => c.id)
        // };
        // setPosts(prev => [newMeetPost, ...prev]); // Requires setPosts state
        setMeetingLinkInput('');
        setSuccess("Meeting started! Link opened in a new tab.");
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
                        />
                        <select className="w-full px-3 py-2 border rounded-lg">
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={String(cls.id)} value={cls.id != null ? String(cls.id) : ''}>{cls.name}</option>
                            ))}
                        </select>
                        <input type="datetime-local" className="w-full px-3 py-2 border rounded-lg" />
                        <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg">
                            Schedule Meeting
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                            <h4 className="font-medium">Mathematics Year 1 - Algebra Review</h4>
                            <p className="text-sm text-gray-600">Today, 2:00 PM - 3:00 PM</p>
                        </div>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                            Join
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
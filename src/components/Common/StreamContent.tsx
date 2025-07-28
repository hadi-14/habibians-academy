// components/TeacherPortalDashboard/StreamContent.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Video, Megaphone } from 'lucide-react';
import type { Teacher, Class, Post, Meeting, Student } from '@/firebase/definitions';
import { db } from '@/firebase/config';
import { getMeetings } from '@/firebase/functions';
import { listenToClassPosts, createPost } from '@/firebase/functions';

interface StreamContentProps {
    user: Teacher | Student;
    classes: Class[];
    setSuccess: (msg: string) => void;
}

export const StreamContent: React.FC<StreamContentProps> = ({ user, classes, setSuccess }) => {
    const [showPostForm, setShowPostForm] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        message: '',
        targetClass: '',
        type: 'announcement' as 'announcement' | 'general',
    });
    const [posts, setPosts] = useState<Post[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    // Determine if user is a student or teacher
    const isStudent = 'enrolledClasses' in user;
    const isTeacher = !isStudent;

    // Fetch meetings
    useEffect(() => {
        getMeetings(db).then(setMeetings);
    }, []);

    // Fetch posts for teacher's classes
    useEffect(() => {
        if (!classes.length) return;
        const unsubscribes = classes.map(cls => {
            if (!cls.uid) return null;
            return listenToClassPosts(cls.uid, (classPosts) => {
                setPosts(prev => {
                    // Remove old for this class, add new
                    const filtered = prev.filter(a => a.classId !== cls.uid);
                    return [...filtered, ...classPosts];
                });
            });
        });
        return () => { unsubscribes.forEach(u => u && u()); };
    }, [classes]);

    // Only allow creating posts (announcement/general) - Teachers only
    const handleCreatePost = async () => {
        if (!user.uid || !newPost.title || !newPost.message || !newPost.targetClass) {
            setSuccess('Please fill all fields.');
            return;
        }
        try {
            await createPost({
                classId: newPost.targetClass,
                title: newPost.title,
                message: newPost.message,
                type: newPost.type,
                teacherId: user.uid,
            });
            setNewPost({ title: '', message: '', targetClass: '', type: 'announcement' });
            setShowPostForm(false);
            setSuccess('Post created successfully!');
        } catch {
            setSuccess('Failed to create post.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Class Stream</h2>
                {isTeacher && (
                    <div className="flex gap-2">
                        <button onClick={() => setShowPostForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="w-4 h-4" />
                            Create Announcement
                        </button>
                        <button onClick={() => (window.location.href = '/teacher-portal#meet')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Video className="w-4 h-4" />
                            Start Meet
                        </button>
                    </div>
                )}
            </div>
            {isTeacher && showPostForm && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h3>
                    <div className="space-y-4">
                        <select
                            value={newPost.type}
                            onChange={e => setNewPost({ ...newPost, type: e.target.value as 'announcement' | 'general' })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="announcement">Announcement</option>
                            <option value="general">General</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Post title"
                            value={newPost.title}
                            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <textarea
                            placeholder="Write your post"
                            value={newPost.message}
                            onChange={e => setNewPost({ ...newPost, message: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Post to class:</label>
                            <select
                                value={newPost.targetClass}
                                onChange={e => setNewPost({ ...newPost, targetClass: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map(cls => (
                                    <option key={String(cls.uid)} value={String(cls.uid)}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCreatePost}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Post
                            </button>
                            <button
                                onClick={() => setShowPostForm(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Posts Section (including meetings as posts) */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Posts</h3>
                {(() => {
                    // Combine posts and meetings as posts
                    const meetingPosts = meetings.map(meeting => ({
                        uid: meeting.uid,
                        classId: meeting.classId, // Not mapped to a class
                        title: meeting.title,
                        message: meeting.description || '',
                        type: 'meeting',
                        createdAt: meeting.createdAt,
                        teacherId: meeting.CreatedBy,
                        link: meeting.link,
                        meetingTime: meeting.time,
                    }));
                    // Only show future meetings
                    const now = new Date();
                    const filteredMeetingPosts = meetingPosts.filter(mp => mp.meetingTime?.toDate && mp.meetingTime.toDate() >= now);
                    // Merge and sort by createdAt/meetingTime descending
                    const allPosts = [...posts, ...filteredMeetingPosts].sort((a, b) => {
                        const bTime = b.createdAt?.toMillis?.() ?? 0;
                        const aTime = a.createdAt?.toMillis?.() ?? 0;
                        return bTime - aTime;
                    });
                    return allPosts.length > 0 ? (
                        allPosts.map(post => (
                            <div key={post.uid} className={`bg-white rounded-xl p-6 shadow-lg border ${post.type === 'meeting' ? 'border-green-100' : 'border-blue-100'} hover:shadow-md transition-shadow duration-200`}>
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${post.type === 'meeting' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                        {post.type === 'meeting' ? <Video className="w-5 h-5 text-green-600" /> : <Megaphone className="w-5 h-5 text-blue-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
                                        <p className="text-gray-600 mt-1 whitespace-pre-line">{post.message}</p>
                                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                            <span title="Created at">{post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : ''}</span>
                                            {post.type !== 'meeting' && <span title="Class">Class: {classes.find(c => c.uid === post.classId)?.name || post.classId}</span>}
                                            <span title="Type">{post.type.charAt(0).toUpperCase() + post.type.slice(1)}</span>
                                            {post.type === 'meeting' && post.link && (
                                                <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline ml-2">Join</a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow">
                            <p>No posts yet.</p>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};  
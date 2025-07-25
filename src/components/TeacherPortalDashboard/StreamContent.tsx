// components/TeacherPortalDashboard/StreamContent.tsx
import React, { useState } from 'react';
import { Plus, Video, Megaphone, FileText, BookOpen } from 'lucide-react';
import type { Teacher, Class } from '@/firebase/teacher-portal'; // Assuming types are here now

// Define a type for a Post
interface Post {
    id: string; // Use string for consistency, especially if using UUIDs later
    title: string;
    content: string;
    type: 'announcement' | 'assignment' | 'material' | 'question';
    attachments: string[]; // URLs or file paths, adjust type if needed
    targetClasses: string[]; // Array of Class IDs (strings)
    createdAt: string; // Or Date if you prefer, but string is simpler for display
    teacherId: string;
    // Add other post-related fields as needed
}

interface StreamContentProps {
    teacher: Teacher;
    classes: Class[];
    setSuccess: (msg: string) => void;
}

export const StreamContent: React.FC<StreamContentProps> = ({ teacher, classes, setSuccess }) => {
    const [showPostForm, setShowPostForm] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        type: 'announcement' as 'announcement' | 'assignment' | 'material' | 'question',
        attachments: [] as string[], // Explicitly type attachments
        targetClasses: [] as string[]
    });
    const [posts, setPosts] = useState<Post[]>([]); // Use the defined Post type

    const handleCreatePost = () => {
        if (!newPost.title || !newPost.content || newPost.targetClasses.length === 0) {
            // Optionally provide user feedback for missing fields
            console.warn("Post title, content, and at least one target class are required.");
            return;
        }
        const post: Post = {
            id: Date.now().toString(), // Consider using uuid library for better IDs
            ...newPost,
            createdAt: new Date().toLocaleString(),
            teacherId: teacher.uid
        };
        setPosts(prev => [post, ...prev]);
        setNewPost({ title: '', content: '', type: 'announcement', attachments: [], targetClasses: [] });
        setShowPostForm(false);
        setSuccess('Post created successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Class Stream</h2>
                <div className="flex gap-2">
                    <button onClick={() => setShowPostForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        Create Post
                    </button>
                    <button onClick={() => window.open('/teacher-portal/meet', '_blank')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Video className="w-4 h-4" />
                        Start Meet
                    </button>
                </div>
            </div>
            {showPostForm && (
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h3>
                    <div className="space-y-4">
                        <select
                            value={newPost.type}
                            onChange={(e) => setNewPost({ ...newPost, type: e.target.value as Post['type'] })}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        >
                            <option value="announcement">Announcement</option>
                            <option value="assignment">Assignment</option>
                            <option value="material">Material</option>
                            <option value="question">Question</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Post title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required // Add required attribute for better UX
                        />
                        <textarea
                            placeholder="Share with your class"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            required // Add required attribute for better UX
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Post to classes:</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                {classes.map(cls => {
                                    // Ensure cls.id is a string before using it
                                    if (typeof cls.id !== 'string') {
                                        console.error("Class ID is not a string:", cls.id);
                                        return null; // Skip rendering if ID is invalid
                                    }
                                    return (
                                        <label key={cls.id} className="flex items-center py-1">
                                            <input
                                                type="checkbox"
                                                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                checked={newPost.targetClasses.includes(cls.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        if (typeof cls.id === 'string') {
                                                            setNewPost({ ...newPost, targetClasses: [...newPost.targetClasses, cls.id] });
                                                        }
                                                    } else {
                                                        setNewPost({ ...newPost, targetClasses: newPost.targetClasses.filter(id => id !== cls.id) });
                                                    }
                                                }}
                                            />
                                            <span className="text-gray-700">{cls.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Optional: Add attachment input */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (optional)</label>
                             // Implement file input for attachments if needed
                        </div> */}
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
            <div className="space-y-4">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    {post.type === 'announcement' && <Megaphone className="w-5 h-5 text-blue-600" />}
                                    {post.type === 'assignment' && <FileText className="w-5 h-5 text-green-600" />}
                                    {post.type === 'material' && <BookOpen className="w-5 h-5 text-purple-600" />}
                                    {post.type === 'question' && <span className="text-blue-600 font-bold text-lg">?</span>} {/* Simple fallback for question */}
                                </div>
                                <div className="flex-1 min-w-0"> {/* min-w-0 helps with text truncation */}
                                    <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
                                    <p className="text-gray-600 mt-1 whitespace-pre-line">{post.content}</p>
                                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                                        <span title="Created at">{post.createdAt}</span>
                                        <span title="Target Classes">{post.targetClasses.length} class{post.targetClasses.length !== 1 ? 'es' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow">
                        <p>No posts yet. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
import React, { useState } from 'react';
import { Plus, Video, Megaphone, FileText, BookOpen } from 'lucide-react';
import type { Teacher, Class } from '@/firebase/teacher-portal';

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
        type: 'announcement',
        attachments: [],
        targetClasses: [] as string[] // Specify type
    });
    const [posts, setPosts] = useState<any[]>([]); // Consider typing posts

    const handleCreatePost = () => {
        if (!newPost.title || !newPost.content || newPost.targetClasses.length === 0) return;
        const post = {
            id: Date.now().toString(),
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
                    <button onClick={() => setShowPostForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                        <Plus className="w-4 h-4" />
                        Create Post
                    </button>
                    <button onClick={() => window.open('/teacher-portal/meet', '_blank')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                        <Video className="w-4 h-4" />
                        Start Meet
                    </button>
                </div>
            </div>
            {showPostForm && (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="space-y-4">
                        <select value={newPost.type} onChange={(e) => setNewPost({ ...newPost, type: e.target.value })} className="px-4 py-3 border rounded-lg">
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
                            className="w-full px-4 py-3 border rounded-lg"
                        />
                        <textarea
                            placeholder="Share with your class"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            className="w-full px-4 py-3 border rounded-lg"
                            rows={4}
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2">Post to classes:</label>
                            <div className="space-y-2">
                                {classes.map(cls => (
                                    <label key={cls.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={newPost.targetClasses.includes(cls.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewPost({ ...newPost, targetClasses: [...newPost.targetClasses, cls.id] });
                                                } else {
                                                    setNewPost({ ...newPost, targetClasses: newPost.targetClasses.filter(id => id !== cls.id) });
                                                }
                                            }}
                                        />
                                        {cls.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleCreatePost} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                                Post
                            </button>
                            <button onClick={() => setShowPostForm(false)} className="px-6 py-2 bg-gray-300 rounded-lg">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="bg-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                {post.type === 'announcement' && <Megaphone className="w-5 h-5 text-blue-600" />}
                                {post.type === 'assignment' && <FileText className="w-5 h-5 text-green-600" />}
                                {post.type === 'material' && <BookOpen className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{post.title}</h3>
                                <p className="text-gray-600 mt-1">{post.content}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                    <span>{post.createdAt}</span>
                                    <span>{post.targetClasses.length} classes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
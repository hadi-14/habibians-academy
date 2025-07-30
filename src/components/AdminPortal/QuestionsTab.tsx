'use client';
import React, { useState } from 'react';
import { Eye, X, CheckCircle, XCircle } from 'lucide-react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Question } from '@/firebase/definitions';

interface QuestionsTabProps {
    questions: Question[];
    setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({ questions, setQuestions }) => {
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

    const getQuestionStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-amber-100 text-amber-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-emerald-100 text-emerald-800';
            case 'closed': return 'bg-rose-100 text-rose-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (timestamp: { seconds: number, nanoseconds: number }) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const updateQuestionStatus = async (questionId: string, status: 'new' | 'in-progress' | 'resolved' | 'closed', answer?: string) => {
        if (!questionId) return;

        try {
            const questionRef = doc(db, 'queries', questionId);
            const updateData: { status: string, answer?: string } = { status };
            if (answer) updateData.answer = answer;

            await updateDoc(questionRef, updateData);

            setQuestions(questions.map(q =>
                q.id === questionId ? { ...q, status, ...(answer ? { answer } : {}) } : q
            ));

            setSelectedQuestion(null);
        } catch (error) {
            console.error("Error updating question status:", error);
        }
    };

    const deleteQuestion = async (questionId: string) => {
        if (!questionId) return;

        try {
            await deleteDoc(doc(db, 'queries', questionId));
            setQuestions(questions.filter(q => q.id !== questionId));
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
                    <h2 className="text-2xl font-bold">Admission Questions</h2>
                </div>
                <div className="p-6">
                    {questions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">No questions submitted yet</p>
                            <p className="text-gray-400 text-sm">Questions from admission inquiries will appear here</p>
                        </div>
                    ) : (
                        questions.map((q) => (
                            <div
                                key={q.id}
                                className="border-b border-indigo-50 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-indigo-50/50 transition-colors duration-200"
                            >
                                <div className="flex-grow pr-0 sm:pr-4 mb-4 sm:mb-0">
                                    <p className="font-medium text-gray-800">{q.question}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        From: {q.fullName} ({q.email})
                                    </p>
                                    <span
                                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getQuestionStatusColor(q.status)}`}
                                    >
                                        {q.status}
                                    </span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Submitted on: {formatDate(q.createdAt)}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setSelectedQuestion(q)}
                                        className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full transition-colors duration-200"
                                        title="Manage Question"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => deleteQuestion(q.id)}
                                        className="text-rose-600 hover:bg-rose-100 p-2 rounded-full transition-colors duration-200"
                                        title="Delete Question"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Question Management Modal */}
            {selectedQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 transition-opacity duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative transform transition-all duration-300 scale-100">
                        <button
                            onClick={() => setSelectedQuestion(null)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-indigo-800 border-b border-indigo-100 pb-3">
                            Question Management
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <p className="font-medium text-lg text-gray-800">{selectedQuestion.question}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    From: {selectedQuestion.fullName} ({selectedQuestion.email})
                                </p>
                                <p className="text-sm text-gray-600">
                                    Contact: {selectedQuestion.contactNumber}
                                </p>
                                <span
                                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getQuestionStatusColor(selectedQuestion.status)}`}
                                >
                                    Current Status: {selectedQuestion.status}
                                </span>
                            </div>

                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Answer</label>
                                <textarea
                                    id="answer"
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                    placeholder="Enter your answer here..."
                                    defaultValue={selectedQuestion.answer || ''}
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        const answerTextarea = document.getElementById('answer') as HTMLTextAreaElement;
                                        updateQuestionStatus(selectedQuestion.id, 'resolved', answerTextarea.value);
                                    }}
                                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-500 transition-colors duration-200 flex items-center font-medium"
                                >
                                    <CheckCircle className="mr-2" size={20} /> Mark as Resolved
                                </button>
                                <button
                                    onClick={() => {
                                        const answerTextarea = document.getElementById('answer') as HTMLTextAreaElement;
                                        updateQuestionStatus(selectedQuestion.id, 'in-progress', answerTextarea.value);
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors duration-200 flex items-center font-medium"
                                >
                                    In Progress
                                </button>
                                <button
                                    onClick={() => updateQuestionStatus(selectedQuestion.id, 'closed')}
                                    className="bg-rose-600 text-white px-4 py-2 rounded-xl hover:bg-rose-500 transition-colors duration-200 flex items-center font-medium"
                                >
                                    <XCircle className="mr-2" size={20} /> Close Question
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionsTab;
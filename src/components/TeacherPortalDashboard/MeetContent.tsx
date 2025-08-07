import React, { useState, useEffect, useCallback } from 'react';
import { Video, Calendar, Clock, Users, ExternalLink, AlertCircle } from 'lucide-react';
import type { Class, Meeting } from '@/firebase/definitions';
import { getAllStudents, getMeetings } from '@/firebase/functions';
import { db } from '@/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface MeetContentProps {
    classes: Class[];
    setSuccess: (msg: string) => void;
}

// Type definitions for Google APIs
interface GoogleAuth {
    credential: string;
}

interface GoogleTokenResponse {
    access_token?: string;
    error?: string;
}

interface GoogleOAuth2Error {
    type?: string;
    message?: string;
}

interface GoogleTokenClient {
    requestAccessToken: (options: { prompt?: string }) => void;
}

declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: GoogleAuth) => void;
                    }) => void;
                };
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (response: GoogleTokenResponse) => void;
                        error_callback: (error: GoogleOAuth2Error) => void;
                    }) => GoogleTokenClient;
                    revoke: (token: string, callback: () => void) => void;
                };
            };
        };
        gapi: unknown;
    }
}

export const MeetContent: React.FC<MeetContentProps> = ({ classes, setSuccess }) => {
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetingDescription, setMeetingDescription] = useState('');
    const [meetingClassId, setMeetingClassId] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
    const [googleAccessToken, setGoogleAccessToken] = useState<string>('');
    const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Wrap setSuccess in useCallback to avoid useEffect dependency issues
    const memoizedSetSuccess = useCallback(setSuccess, [setSuccess]);

    // Initialize Google Identity Services
    useEffect(() => {
        const initializeGoogleIdentity = () => {
            console.log('Initializing Google Identity Services...');
            console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

            if (window.google && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
                try {
                    // Initialize Google Identity Services
                    window.google.accounts.id.initialize({
                        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                        callback: (response: GoogleAuth) => {
                            console.log('Google ID token received:', response);
                        }
                    });

                    // Initialize OAuth2 for accessing APIs
                    window.google.accounts.oauth2.initTokenClient({
                        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
                        callback: (response: GoogleTokenResponse) => {
                            if (response.access_token) {
                                setGoogleAccessToken(response.access_token);
                                setIsGoogleSignedIn(true);
                                memoizedSetSuccess("Successfully signed in to Google!");
                                console.log('OAuth2 token received');
                            } else {
                                console.error('No access token in response:', response);
                            }
                        },
                        error_callback: (error: GoogleOAuth2Error) => {
                            console.error('OAuth2 error:', error);
                            setIsGoogleSignedIn(false);
                            setGoogleAccessToken('');
                        }
                    });

                    console.log('Google Identity Services initialized successfully');
                } catch (error) {
                    console.error('Google Identity Services initialization failed:', error);
                }
            } else {
                console.error('Google Identity Services not loaded or Client ID missing');
                if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
                    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
                }
            }
        };

        // Load Google Identity Services script
        if (!window.google?.accounts) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
                console.log('Google Identity Services script loaded');
                // Add a small delay to ensure the API is fully loaded
                setTimeout(initializeGoogleIdentity, 100);
            };
            script.onerror = () => {
                console.error('Failed to load Google Identity Services script');
            };
            document.body.appendChild(script);
        } else {
            initializeGoogleIdentity();
        }
    }, [memoizedSetSuccess]);

    useEffect(() => {
        getMeetings(db).then(meetings => {
            const now = new Date();
            // Show meetings that end at least 1 hour after now
            const filtered = meetings.filter(m => {
                if (!m.time?.toDate) return false;
                const start = m.time.toDate();
                const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
                return end >= now;
            });
            filtered.sort((a, b) => a.time.toDate().getTime() - b.time.toDate().getTime());
            setUpcomingMeetings(filtered);
        }).catch(() => setUpcomingMeetings([]));
    }, []);

    // Persist Google sign-in session in localStorage
    useEffect(() => {
        // On mount, restore session if available
        const token = localStorage.getItem('googleAccessToken');
        const signedIn = localStorage.getItem('isGoogleSignedIn');
        if (token && signedIn === 'true') {
            setGoogleAccessToken(token);
            setIsGoogleSignedIn(true);
        }
    }, []);

    useEffect(() => {
        // Save session to localStorage on change
        if (isGoogleSignedIn && googleAccessToken) {
            localStorage.setItem('googleAccessToken', googleAccessToken);
            localStorage.setItem('isGoogleSignedIn', 'true');
        } else {
            localStorage.removeItem('googleAccessToken');
            localStorage.removeItem('isGoogleSignedIn');
        }
    }, [isGoogleSignedIn, googleAccessToken]);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);

            // Check if Google Identity Services is loaded
            if (!window.google?.accounts?.oauth2) {
                throw new Error('Google Identity Services not loaded');
            }

            // Check if client ID is configured
            if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
                throw new Error('Google Client ID not configured');
            }

            console.log('Attempting to sign in with Google Identity Services...');

            // Create and request access token
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
                callback: (response: GoogleTokenResponse) => {
                    console.log('Token response:', response);

                    if (response.error) {
                        console.error('Token error:', response.error);
                        throw new Error(response.error);
                    }

                    if (response.access_token) {
                        setGoogleAccessToken(response.access_token);
                        setIsGoogleSignedIn(true);
                        setSuccess("Successfully signed in to Google!");
                        setIsLoading(false);
                    } else {
                        throw new Error('No access token received');
                    }
                },
                error_callback: (error: GoogleOAuth2Error) => {
                    console.error('OAuth2 callback error:', error);
                    setIsLoading(false);

                    let errorMessage = "Failed to sign in to Google. ";
                    if (error.type === 'popup_closed') {
                        errorMessage += "Sign-in popup was closed. Please try again.";
                    } else {
                        errorMessage += "Please check your internet connection and try again.";
                    }
                    alert(errorMessage);
                }
            });

            // Request access token
            tokenClient.requestAccessToken({
                prompt: 'consent'
            });

        } catch (error) {
            console.error('Google sign-in failed:', error);
            setIsLoading(false);

            let errorMessage = "Failed to sign in to Google. ";

            if (error instanceof Error) {
                if (error.message?.includes('Client ID')) {
                    errorMessage += "Configuration error. Please check your Google Client ID.";
                } else if (error.message?.includes('not loaded')) {
                    errorMessage += "Google services not available. Please refresh the page.";
                } else {
                    errorMessage += "Please check your internet connection and try again.";
                }
            } else {
                errorMessage += "Please check your internet connection and try again.";
            }

            alert(errorMessage);
        }
    };

    const handleGoogleSignOut = async () => {
        try {
            // Revoke the access token
            if (googleAccessToken && window.google?.accounts?.oauth2) {
                window.google.accounts.oauth2.revoke(googleAccessToken, () => {
                    console.log('Access token revoked');
                });
            }

            setGoogleAccessToken('');
            setIsGoogleSignedIn(false);
            localStorage.removeItem('googleAccessToken');
            localStorage.removeItem('isGoogleSignedIn');
            setSuccess("Successfully signed out of Google.");
        } catch (error) {
            console.error('Google sign-out failed:', error);
            // Still clear local state even if revoke fails
            setGoogleAccessToken('');
            setIsGoogleSignedIn(false);
        }
    };

    const handleStartInstantMeeting = async () => {
        if (!meetingTitle.trim() || !meetingClassId) {
            alert("Please enter a meeting title and select a class.");
            return;
        }
        if (!isGoogleSignedIn || !googleAccessToken) {
            alert("Please sign in to Google first to start an instant meeting.");
            return;
        }
        setIsLoading(true);
        try {
            // Fetch students enrolled in the selected class
            const students = await getAllStudents();
            const participants: string[] = [];
            students.forEach(data => {
                if (
                    Array.isArray(data.enrolledClasses) &&
                    data.enrolledClasses.includes(meetingClassId) &&
                    typeof data.email === 'string'
                ) {
                    participants.push(data.email);
                }
            });

            const now = new Date();

            // Create event in Google Calendar (and Meet)
            const res = await fetch('/api/create-calendar-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: meetingTitle,
                    classId: meetingClassId,
                    time: now.toISOString(),
                    access_token: googleAccessToken,
                    participants,
                    description: meetingDescription,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Save to Firestore with the Meet link
                await addDoc(collection(db, 'meetings'), {
                    title: meetingTitle,
                    link: data.meetLink || '',
                    classId: meetingClassId,
                    time: now,
                    createdAt: serverTimestamp(),
                    description: meetingDescription || 'Created via Google Calendar with Meet link',
                    CreatedBy: '',
                    eventId: data.eventId,
                });

                setMeetingTitle('');
                setMeetingDescription('');
                setMeetingClassId('');
                setMeetingTime('');
                setSuccess("Instant meeting started and saved! Google Meet link opened in a new tab.");
                if (data.meetLink) {
                    window.open(data.meetLink, '_blank');
                }
                // Refresh meetings list
                getMeetings(db).then(meetings => {
                    const now = new Date();
                    // Show meetings that end at least 1 hour after now
                    const filtered = meetings.filter(m => {
                        if (!m.time?.toDate) return false;
                        const start = m.time.toDate();
                        const end = new Date(start.getTime() + 60 * 60 * 1000);
                        return end >= now;
                    });
                    filtered.sort((a, b) => a.time.toDate().getTime() - b.time.toDate().getTime());
                    setUpcomingMeetings(filtered);
                });
            } else {
                console.error('API Error:', data);
                if (data.error?.includes('Authentication failed') || data.error?.includes('invalid_token')) {
                    setIsGoogleSignedIn(false);
                    setGoogleAccessToken('');
                    alert("Google authentication expired. Please sign in again.");
                } else {
                    alert(data.error || "Failed to create instant Google Meet event.");
                }
            }
        } catch (error) {
            console.error('Error creating instant Google Meet event:', error);
            alert("Error creating instant Google Meet event. Please check your internet connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGoogleCalendarEvent = async () => {
        if (!meetingTitle.trim() || !meetingClassId || !meetingTime) {
            alert("Please fill all fields for scheduling a meeting.");
            return;
        }
        if (!isGoogleSignedIn || !googleAccessToken) {
            alert("Please sign in to Google first to create calendar events.");
            return;
        }
        setIsLoading(true);
        try {
            // Fetch students enrolled in the selected class
            const students = await getAllStudents();
            const participants: string[] = [];
            students.forEach(data => {
                if (
                    Array.isArray(data.enrolledClasses) &&
                    data.enrolledClasses.includes(meetingClassId) &&
                    typeof data.email === 'string'
                ) {
                    participants.push(data.email);
                }
            });

            const res = await fetch('/api/create-calendar-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: meetingTitle,
                    classId: meetingClassId,
                    time: meetingTime,
                    access_token: googleAccessToken,
                    participants,
                    description: meetingDescription,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Save to Firestore with the Meet link
                await addDoc(collection(db, 'meetings'), {
                    title: meetingTitle,
                    link: data.meetLink || '',
                    classId: meetingClassId,
                    time: new Date(meetingTime),
                    createdAt: serverTimestamp(),
                    description: meetingDescription || 'Created via Google Calendar with Meet link',
                    CreatedBy: '',
                    eventId: data.eventId,
                });

                setMeetingTitle('');
                setMeetingDescription('');
                setMeetingClassId('');
                setMeetingTime('');
                setSuccess(`Google Calendar event created with Meet link! ${data.meetLink ? 'Meet link: ' + data.meetLink : ''}`);
                if (data.htmlLink) {
                    window.open(data.htmlLink, '_blank');
                }
                // Refresh meetings list
                getMeetings(db).then(meetings => {
                    const now = new Date();
                    // Show meetings that end at least 1 hour after now
                    const filtered = meetings.filter(m => {
                        if (!m.time?.toDate) return false;
                        const start = m.time.toDate();
                        const end = new Date(start.getTime() + 60 * 60 * 1000);
                        return end >= now;
                    });
                    filtered.sort((a, b) => a.time.toDate().getTime() - b.time.toDate().getTime());
                    setUpcomingMeetings(filtered);
                });
            } else {
                console.error('API Error:', data);
                if (data.error?.includes('Authentication failed') || data.error?.includes('invalid_token')) {
                    setIsGoogleSignedIn(false);
                    setGoogleAccessToken('');
                    alert("Google authentication expired. Please sign in again.");
                } else {
                    alert(data.error || "Failed to create Google Calendar event.");
                }
            }
        } catch (error) {
            console.error('Error creating Google Calendar event:', error);
            alert("Error creating Google Calendar event. Please check your internet connection and try again.");
        } finally {
            setIsLoading(false);
        }
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
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `in ${hours}h`;
        } else {
            const days = Math.floor(diffInMinutes / 1440);
            return `in ${days}d`;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Google Meet Integration</h2>

                {/* Google Sign In/Out Button */}
                <div className="flex items-center gap-3">
                    {isGoogleSignedIn ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600 font-medium">✓ Google Connected</span>
                            <button
                                onClick={handleGoogleSignOut}
                                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                disabled={isLoading}
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGoogleSignIn}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {isLoading ? 'Signing in...' : 'Sign in with Google'}
                        </button>
                    )}
                </div>
            </div>

            {!isGoogleSignedIn && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <p className="text-amber-800 text-sm">
                            Sign in with Google to create calendar events with automatic Google Meet links.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unified Meeting Form */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-semibold mb-4">Create Meeting</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Meeting title"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={meetingTitle}
                            onChange={e => setMeetingTitle(e.target.value)}
                            disabled={isLoading}
                        />
                        <textarea
                            placeholder="Optional description"
                            value={meetingDescription}
                            onChange={e => setMeetingDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={2}
                            disabled={isLoading}
                        />
                        <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={meetingClassId}
                            onChange={e => setMeetingClassId(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={String(cls.uid)} value={String(cls.uid)}>{cls.name}</option>
                            ))}
                        </select>
                        <input
                            type="datetime-local"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={meetingTime}
                            onChange={e => setMeetingTime(e.target.value)}
                            disabled={isLoading}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleStartInstantMeeting}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 ${isGoogleSignedIn
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-400 text-white cursor-not-allowed'
                                    }`}
                                disabled={isLoading || !isGoogleSignedIn}
                                type="button"
                            >
                                <Video className="w-5 h-5" />
                                {isLoading ? 'Starting...' : 'Start Instant Meeting'}
                            </button>
                            <button
                                className={`flex-1 px-6 py-3 rounded-lg text-white transition-colors disabled:opacity-50 ${isGoogleSignedIn
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                onClick={handleCreateGoogleCalendarEvent}
                                disabled={isLoading || !isGoogleSignedIn}
                                type="button"
                            >
                                {isLoading ? 'Creating...' : 'Schedule on Calendar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Upcoming Meetings Section */}
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
                                // Add ongoingNow if meeting is within next hour
                                let ongoingNow = false;
                                if (meeting.time?.toDate) {
                                    const start = meeting.time.toDate();
                                    const now = new Date();
                                    const diffMs = start.getTime() - now.getTime();
                                    ongoingNow = diffMs <= 60 * 60 * 1000 && diffMs > 0;
                                }

                                return (
                                    <div
                                        key={meeting.uid}
                                        className={`relative border rounded-xl p-5 transition-all duration-200 hover:shadow-md ${isStartingSoon
                                            ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        {/* Ongoing Now Tag */}
                                        {ongoingNow && (
                                            <div className="absolute -top-2 left-2">
                                                <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                                    ONGOING NOW
                                                </span>
                                            </div>
                                        )}
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
                                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isStartingSoon ? 'bg-green-500' : 'bg-blue-500'
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
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isStartingSoon
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
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isStartingSoon
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
        </div>
    );
};
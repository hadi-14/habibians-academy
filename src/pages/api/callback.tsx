// pages/auth/callback.tsx (for Pages Router)
// or app/auth/callback/page.tsx (for App Router)

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle OAuth callback
    const handleCallback = () => {
      // The Google OAuth flow will handle the callback automatically
      // when using the Google API client library (gapi)
      // This page is just a landing page that redirects back to the app
      
      // Close popup window if opened in popup mode
      if (window.opener) {
        window.opener.postMessage('auth-success', window.location.origin);
        window.close();
      } else {
        // Redirect back to the main app
        router.push('/dashboard'); // or wherever your MeetContent component is
      }
    };

    // Small delay to ensure Google handles the callback
    setTimeout(handleCallback, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Completing Google Authentication
        </h2>
        <p className="text-gray-600">
          Please wait while we finish setting up your Google integration...
        </p>
      </div>
    </div>
  );
}
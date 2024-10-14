'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; // Import auth from your firebase setup
import { onAuthStateChanged } from 'firebase/auth'; // Import directly from firebase/auth

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email || 'User');
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/'); // Redirect to the login page
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover"
      style={{ backgroundImage: "url('/background.jpg')" }} // Placeholder background image
    >
      <h1 className="text-5xl font-bold mb-10 text-gray-800">Dashboard</h1>
      <div className="absolute top-4 right-4 flex items-center">
        <img
          src="/profile-pic.jpg" // Placeholder for profile picture
          alt="Profile"
          className="w-10 h-10 rounded-full mr-2"
        />
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-lg font-semibold text-black"
          >
            {userName}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          className="bg-orange-500 text-white py-4 px-8 rounded-lg text-xl"
          onClick={() => router.push('/upload')}
        >
          Upload Knowledge Base
        </button>
        <button
          className="bg-orange-500 text-white py-4 px-8 rounded-lg text-xl"
          onClick={() => router.push('/generate')}
        >
          Generate Questions
        </button>
      </div>
    </div>
  );
}

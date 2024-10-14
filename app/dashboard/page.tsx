'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const auth = getAuth();

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-black">Dashboard</h1>
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
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        onClick={() => router.push('/upload')}
      >
        Upload Knowledge Base
      </button>
      <button className="bg-blue-500 text-white py-2 px-4 rounded">
        Generate Questions
      </button>
    </div>
  );
}

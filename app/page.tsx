'use client';

import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import EmailAuth from './components/EmailAuth';
import SignInButton from './components/SignInButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col justify-center items-center p-8 bg-gray-100">
      {user ? (
        <div className="absolute top-4 right-4 flex items-center">
          <img
            src="/profile-pic.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full mr-2"
          />
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-lg font-semibold"
            >
              Gary Iyer
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                <button
                  onClick={() => auth.signOut()}
                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p>You are not logged in</p>
          <EmailAuth />
          <SignInButton />
        </div>
      )}
      {user && (
        <div className="border border-gray-300 p-8 w-full max-w-2xl bg-white">
          <h1 className="text-2xl font-bold mb-4">Test Questions Generator</h1>
          <div className="flex flex-col items-start mb-8">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
              onClick={() => router.push('/upload')} // Navigate to Upload page
            >
              Upload Knowledge Base
            </button>
            <button className="bg-blue-500 text-white py-2 px-4 rounded">
              Generate Questions
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

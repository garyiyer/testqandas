'use client';

import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import EmailAuth from './components/EmailAuth';
import SignInButton from './components/SignInButton';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Set loading to false after checking auth state
    });

    return () => unsubscribe();
  }, []);

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to my Next.js app with Firebase!</h1>
      <Link href="/upload" className="text-blue-500 hover:text-blue-700">
        Upload Knowledge Base
      </Link>
      {user ? (
        <div>
          <p>You are logged in as: {user.email}</p>
          <button 
            onClick={() => auth.signOut()}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <p>You are not logged in</p>
          <EmailAuth />
          <SignInButton />
        </div>
      )}
    </main>
  );
}

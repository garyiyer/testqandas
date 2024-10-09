'use client';

import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import SignInButton from './components/SignInButton';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Render a loading state if useState is not available
  if (typeof useState === 'undefined') {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Welcome to my Next.js app with Firebase!</h1>
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
          <SignInButton />
        </div>
      )}
    </main>
  );
}

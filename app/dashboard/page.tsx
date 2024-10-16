'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import auth from your firebase setup
import { onAuthStateChanged } from 'firebase/auth'; // Import directly from firebase/auth
import Link from 'next/link';
import Header from '../components/Header';

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.email || 'User');
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
      <Header title="Dashboard" userName={userName} />
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="flex space-x-4">
          <Link href="/upload">
            <button className="bg-orange-500 text-white py-4 px-8 rounded-lg text-xl">
              Upload Knowledge Base
            </button>
          </Link>
          <Link href="/response">
            <button className="bg-orange-500 text-white py-4 px-8 rounded-lg text-xl">
              Generate Questions
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}

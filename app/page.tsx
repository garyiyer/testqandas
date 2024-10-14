'use client';

import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import EmailAuth from './components/EmailAuth';
import SignInButton from './components/SignInButton';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/dashboard'); // Redirect to the Dashboard page
    }
  }, [user, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return null; // Prevent rendering the login page if user is authenticated
  }

  return (
    <div className="login-page">
      <header className="flex justify-between items-center p-4 bg-black bg-opacity-70">
        <div>Logo</div>
        <nav>
          <a href="#" className="text-white mx-2">HOME</a>
          <a href="#" className="text-white mx-2">ABOUT</a>
          <a href="#" className="text-white mx-2">SERVICE</a>
          <a href="#" className="text-white mx-2">CONTACT</a>
        </nav>
        <div>
          <input type="text" placeholder="Type to Search" className="p-1" />
          <button className="bg-orange-500 text-white p-1">Search</button>
        </div>
      </header>
      <main className="flex justify-between items-center mt-20">
        <div className="main-content">
          <h1>Generate Test Questions from any textbook you can upload</h1>
          <p>We help students prepare for their exams by generating practice questions.</p>
        </div>
        <div className="login-form bg-black bg-opacity-80 p-6 rounded-lg w-80 mr-10">
          <h2 className="text-white text-2xl mb-4">Login Here</h2>
          <EmailAuth />
          <SignInButton />
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import EmailAuth from './components/EmailAuth';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <EmailAuth />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#1E293B] text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-[#FFA500] mr-2" />
            <span className="text-xl font-bold">EduAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-white hover:text-[#FFA500]">Home</a>
            <a href="#about" className="text-white hover:text-[#FFA500]">About</a>
            <a href="#features" className="text-white hover:text-[#FFA500]">Features</a>
            <a href="#pricing" className="text-white hover:text-[#FFA500]">Pricing</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowLogin(true)} className="text-white hover:text-[#FFA500]">Sign In</button>
            <button onClick={() => setShowLogin(true)} className="bg-[#FFA500] text-white px-4 py-2 rounded hover:bg-[#FFB732]">Sign Up</button>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-white">
        <section className="py-20">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold text-[#1E293B] mb-6">
                AI-powered practice questions, tailored for students and lecturers
              </h1>
              <p className="text-xl text-[#4B5563] mb-8">
                Enhance learning and teaching with our intelligent question generation platform.
              </p>
              <button onClick={() => setShowLogin(true)} className="bg-[#FFA500] text-white px-6 py-3 rounded text-lg font-semibold hover:bg-[#FFB732]">
                Get Started for Free
              </button>
            </div>
            <div className="hidden md:block">
              <img
                src="https://source.unsplash.com/random/600x400?education"
                alt="Education illustration"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#1E293B] text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 text-[#FFA500] mr-2" />
            <span className="text-sm">© 2024 EduAI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

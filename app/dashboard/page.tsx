'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import auth from your firebase setup
import { onAuthStateChanged } from 'firebase/auth'; // Import directly from firebase/auth
import Link from 'next/link';
import { Home, Book, HelpCircle, FileText, BarChart2, Settings, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      } else {
        setUserName(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#1E293B] text-white">
        <div className="flex items-center p-4">
          <Book className="h-8 w-8 text-orange-500" />
          <span className="ml-2 text-xl font-bold">EduAI</span>
        </div>
        <nav className="mt-8">
          <NavItem href="/dashboard" icon={<Home size={20} />} text="Dashboard" active />
          <NavItem href="/upload" icon={<Book size={20} />} text="Knowledge Base" />
          <NavItem href="/response" icon={<HelpCircle size={20} />} text="Question Generation" />
          <NavItem href="/assignments" icon={<FileText size={20} />} text="Assignments" />
          <NavItem href="/analytics" icon={<BarChart2 size={20} />} text="Analytics" />
          <NavItem href="/settings" icon={<Settings size={20} />} text="Settings" />
          <NavItem href="/logout" icon={<LogOut size={20} />} text="Logout" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex justify-between items-center py-4 px-6 bg-white border-b">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center">
            <span className="text-gray-800 mr-2">{userName}</span>
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">{userName?.[0].toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="grid grid-cols-3 gap-6">
            <StatCard title="Total Knowledge Bases" value="15" icon={<Book className="h-8 w-8 text-white" />} link="View all" linkHref="/upload" />
            <StatCard title="Generated Questions" value="253" icon={<HelpCircle className="h-8 w-8 text-white" />} link="Generate more" linkHref="/response" />
            <StatCard title="Active Assignments" value="7" icon={<FileText className="h-8 w-8 text-white" />} link="View assignments" linkHref="/assignments" />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, text, active = false }: { href: string; icon: React.ReactNode; text: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center py-2 px-4 ${active ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>
      {icon}
      <span className="mx-4 font-medium">{text}</span>
    </Link>
  );
}

function StatCard({ title, value, icon, link, linkHref }: { title: string; value: string; icon: React.ReactNode; link: string; linkHref: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-full bg-orange-500 bg-opacity-75">
          {icon}
        </div>
        <div className="mx-5">
          <h4 className="text-2xl font-semibold text-gray-700">{value}</h4>
          <div className="text-gray-500">{title}</div>
        </div>
      </div>
      <Link href={linkHref} className="text-sm font-semibold text-blue-500 hover:text-blue-600">
        {link}
      </Link>
    </div>
  );
}

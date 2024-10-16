import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';

interface HeaderProps {
  title: string;
  userName: string | null;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, userName, showBackButton = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="w-full flex justify-between items-center p-4">
      <div className="w-1/3">
        {showBackButton && (
          <Link href="/dashboard" className="bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600">
            Dashboard
          </Link>
        )}
      </div>
      <h1 className="text-3xl font-bold text-center w-1/3 text-white">{title}</h1>
      <div className="w-1/3 flex justify-end items-center">
        {userName && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center focus:outline-none"
            >
              <span className="mr-2 text-white">{userName}</span>
              <Image
                src="/profile-pic.jpg"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

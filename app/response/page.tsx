'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ChunkSelection from '../components/ChunkSelection';

const ResponsePage = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email || 'User');
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value.slice(0, 200));
  };

  const handleChunksSelected = (chunks: string[]) => {
    setSelectedChunks(chunks);
  };

  const handleSubmit = async () => {
    if (userInput.trim() === '') {
      setError('Please enter a prompt');
      return;
    }
    if (selectedChunks.length === 0) {
      setError('Please select at least one chunk');
      return;
    }
    setError(null);
    setIsLoading(true);
    setAiResponse(null);

    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const url = `https://us-central1-${projectId}.cloudfunctions.net/callOpenAI`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput, chunks: selectedChunks }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setAiResponse(result.result);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center p-4">
      {/* User profile and dropdown */}
      <div className="absolute top-4 right-4 flex items-center">
        <img src="/profile-pic.jpg" alt="Profile" className="w-10 h-10 rounded-full mr-2" />
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="text-lg font-semibold text-gray-800">
            {userName}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
              <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-5xl font-bold mb-10 text-gray-800">Generate Questions</h1>
      
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/2">
          <textarea
            value={userInput}
            onChange={handleInputChange}
            placeholder="Enter your request e.g. I would like 5 multiple choice questions"
            className="w-full h-32 p-2 border rounded-md resize-none text-black bg-white"
            maxLength={200}
          />
          <div className="text-right text-sm text-gray-500">
            {userInput.length}/200
          </div>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-orange-500 text-white py-4 px-8 rounded-lg text-xl w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Send'}
          </button>
        </div>
        <div className="w-full md:w-1/2">
          <ChunkSelection onChunksSelected={handleChunksSelected} />
        </div>
      </div>
      <div className="mt-8 w-full max-w-4xl p-4 border rounded-md bg-white min-h-[200px] max-h-[400px] overflow-y-auto text-black">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : aiResponse ? (
          <pre className="whitespace-pre-wrap">{aiResponse}</pre>
        ) : (
          "Your generated questions will appear here."
        )}
      </div>
    </div>
  );
};

export default ResponsePage;

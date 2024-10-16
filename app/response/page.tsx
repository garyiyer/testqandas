'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ChunkSelection from '../components/ChunkSelection';
import Header from '../components/Header';

const ResponsePage = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const handleChunksSelected = (chunks: string[]) => {
    setSelectedChunks(chunks);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setAiResponse('');
    console.log('Submitting with:', { prompt: userInput, selectedChunks });
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userInput,
          selectedChunks: selectedChunks,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate response');
        }
        setAiResponse(data.response);
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from server');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setAiResponse(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
      <Header title="Generate Questions" userName={userName} showBackButton={true} />
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your request e.g. I would like 5 multiple choice questions"
              className="w-full h-32 p-2 border rounded-md resize-none text-black bg-white"
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-500">
              {userInput.length}/200
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-orange-500 text-white py-2 px-4 rounded-lg text-lg w-full hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Generate Questions'}
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <ChunkSelection onChunksSelected={setSelectedChunks} />
          </div>
        </div>
        <div className="mt-8 w-full max-w-4xl p-4 border rounded-md bg-white min-h-[200px] max-h-[600px] overflow-y-auto text-black">
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
      </main>
    </div>
  );
};

export default ResponsePage;

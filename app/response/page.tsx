'use client';

import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { Home, Book, HelpCircle, FileText, BarChart2, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function QuestionGeneration() {
  const [userName, setUserName] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<string>('Multiple Choice');
  const [competencyLevel, setCompetencyLevel] = useState<string>('Intermediate');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [userInput, setUserInput] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User authenticated:', user.uid);
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
        fetchUploadedFiles();
      } else {
        console.log('No authenticated user');
        setUserName(null);
        setUploadedFiles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user');
        setError('Please log in to view your files.');
        return;
      }

      console.log('Current user:', user.uid);

      // Fetch from 'files' collection
      const filesQuery = query(collection(firestore, 'files'));
      const filesSnapshot = await getDocs(filesQuery);
      const filesData = filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collection: 'files' }));
      console.log('Files fetched:', filesData.length);

      // Fetch from 'uploads' collection (only user's documents)
      const uploadsQuery = query(collection(firestore, 'uploads'), where('userId', '==', user.uid));
      const uploadsSnapshot = await getDocs(uploadsQuery);
      const uploadsData = uploadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), collection: 'uploads' }));
      console.log('Uploads fetched:', uploadsData.length);

      // Combine the results
      const allFiles = [...filesData, ...uploadsData];
      setUploadedFiles(allFiles);
      console.log('Total files fetched:', allFiles.length);

    } catch (error) {
      console.error('Error in fetchUploadedFiles:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
      }
      setError('Failed to fetch uploaded files. Please try again later.');
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError(null);
    setGeneratedQuestions([]);

    const prompt = `Generate ${numQuestions} ${questionType} questions at ${competencyLevel} level. ${userInput}`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          selectedChunks: selectedFiles,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate questions');
        }
        setGeneratedQuestions(data.questions || [data.response]);
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Received non-JSON response from server');
      }
    } catch (error: any) {
      console.error('Error generating questions:', error);
      setError(`Failed to generate questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#1E2640] text-white">
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">EduAI</h2>
          <nav>
            <NavItem href="/dashboard" icon={<Home size={20} />} text="Dashboard" />
            <NavItem href="/knowledge-base" icon={<Book size={20} />} text="Knowledge Base" />
            <NavItem href="/question-generation" icon={<HelpCircle size={20} />} text="Question Generation" />
            <NavItem href="/assignments" icon={<FileText size={20} />} text="Assignments" />
            <NavItem href="/analytics" icon={<BarChart2 size={20} />} text="Analytics" />
            <NavItem href="/settings" icon={<Settings size={20} />} text="Settings" />
            <NavItem href="/logout" icon={<LogOut size={20} />} text="Logout" />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Question Generation</h1>
            <div className="flex items-center">
              <img src="/user-icon.png" alt="User" className="h-8 w-8 rounded-full mr-2" />
              <span className="text-gray-700">{userName}</span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6 flex flex-col">
          <div className="flex space-x-6 mb-8">
            {/* Left column - Question Generation Options */}
            <div className="w-1/2">
              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Generate Questions</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white text-black"
                    >
                      <option className="text-black">Multiple Choice</option>
                      <option className="text-black">Short Response</option>
                      <option className="text-black">Essay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competency Level</label>
                    <select
                      value={competencyLevel}
                      onChange={(e) => setCompetencyLevel(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md bg-white text-black"
                    >
                      <option className="text-black">Beginner</option>
                      <option className="text-black">Intermediate</option>
                      <option className="text-black">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                    <input
                      type="number"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      min="1"
                      max="20"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Input</label>
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      rows={3}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md text-black"
                      placeholder="Enter your question or topic here..."
                    ></textarea>
                  </div>
                  <button
                    onClick={handleGenerateQuestions}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating...
                      </div>
                    ) : (
                      'Generate Questions'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column - Uploaded Files */}
            <div className="w-1/2">
              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Uploaded Files</h2>
                {uploadedFiles.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {uploadedFiles.map((file) => (
                      <li key={file.id} className="py-4 flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name || `File from ${file.collection}`}</p>
                          <p className="text-sm text-gray-500">
                            {file.type || 'Unknown type'} • 
                            {file.uploadDate ? new Date(file.uploadDate.seconds * 1000).toLocaleDateString() : 'No date'} • 
                            {file.size ? `${file.size} bytes` : 'Size unknown'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No files uploaded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Generated Questions section */}
          {generatedQuestions.length > 0 && (
            <div className="w-full bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Generated Questions</h2>
              <ul className="space-y-2">
                {generatedQuestions.map((question, index) => (
                  <li key={index} className="text-sm text-gray-700">{question}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <Link href={href} className="flex items-center space-x-2 p-2 hover:bg-[#2D3748] rounded-md">
      {icon}
      <span>{text}</span>
    </Link>
  );
}

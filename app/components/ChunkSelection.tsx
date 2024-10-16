import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface Chunk {
  uniqueId: string;
  id: string;
  fileName: string;
  chapterTitle: string;
  text: string;
}

interface ChunkSelectionProps {
  onChunksSelected: (chunks: string[]) => void;
}

const ChunkSelection: React.FC<ChunkSelectionProps> = ({ onChunksSelected }) => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchChunks = async () => {
      if (user) {
        try {
          const filesCollection = collection(firestore, 'processedFiles');
          const filesSnapshot = await getDocs(filesCollection);
          const allChunks: Chunk[] = [];
          filesSnapshot.docs.forEach(doc => {
            const fileChunks = doc.data().chunks || [];
            fileChunks.forEach((chunk: any) => {
              if (chunk && typeof chunk === 'object') {
                const uniqueId = `${doc.id}-${chunk.id}`;
                allChunks.push({
                  uniqueId,
                  id: chunk.id || '',
                  fileName: doc.id,
                  chapterTitle: chunk.chapterTitle || '',
                  text: chunk.text || ''
                });
              }
            });
          });
          setChunks(allChunks);
        } catch (error) {
          console.error("Error fetching chunks:", error);
        }
      }
    };
    fetchChunks();
  }, [user]);

  const handleChunkSelect = (chunkId: string) => {
    const updatedChunks = selectedChunks.includes(chunkId)
      ? selectedChunks.filter(id => id !== chunkId)
      : [...selectedChunks, chunkId];
    setSelectedChunks(updatedChunks);
    onChunksSelected(updatedChunks);
  };

  const filteredChunks = chunks.filter(chunk => 
    chunk.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chunk.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chunk.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chunk-selection bg-white p-4 rounded-lg shadow">
      {user ? (
        <>
          <div className="mb-4">Selected chunks: {selectedChunks.length} / 5</div>
          <input
            type="text"
            placeholder="Search chunks, files, or chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-black"
          />
          <div className="chunks-list h-64 overflow-y-auto border rounded p-2">
            {filteredChunks.map(chunk => (
              <div key={chunk.uniqueId} className="mb-2 p-2 border-b">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedChunks.includes(chunk.uniqueId)}
                    onChange={() => handleChunkSelect(chunk.uniqueId)}
                    disabled={selectedChunks.length >= 5 && !selectedChunks.includes(chunk.uniqueId)}
                    className="mr-2"
                  />
                  <div>
                    <div className="font-bold text-sm text-gray-700">{chunk.fileName} - {chunk.chapterTitle}</div>
                    <div className="text-sm text-gray-600">{chunk.text.substring(0, 100)}...</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-700">Please sign in to access chunks.</p>
      )}
    </div>
  );
};

export default ChunkSelection;

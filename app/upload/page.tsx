'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore, storage } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Header from '../components/Header';

const UploadPage = () => {
	const [userName, setUserName] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [uploadMessage, setUploadMessage] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUserName(user.displayName || user.email || 'User');
			} else {
				setUserName(null);
			}
		});

		return () => unsubscribe();
	}, []);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
			setUploadMessage(null);
			setUploadSuccess(false);
			setError(null);
		}
	};

	const handleChooseFile = () => {
		fileInputRef.current?.click();
	};

	const handleUpload = async () => {
		if (!file) return;

		setUploading(true);
		setError(null);
		setUploadSuccess(false);

		try {
			const filesCollection = collection(firestore, 'files');
			const q = query(filesCollection, where('name', '==', file.name));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				const userConfirmed = window.confirm('File already exists. Do you want to replace it?');
				if (!userConfirmed) {
					setUploadMessage('Upload cancelled.');
					setUploading(false);
					return;
				}
			}

			setUploadMessage('Upload in progress...');
			const storageRef = ref(storage, `uploads/${file.name}`);
			await uploadBytes(storageRef, file);

			const fileDoc = doc(filesCollection, file.name);
			await setDoc(fileDoc, {
				name: file.name,
				size: file.size,
				type: file.type,
				lastModified: file.lastModified,
			});

			setUploadSuccess(true);
			setUploadMessage('File uploaded successfully. Ready for AI processing.');
		} catch (error) {
			console.error('Error uploading file:', error);
			setError('An error occurred while uploading the file.');
			setUploadSuccess(false);
		} finally {
			setUploading(false);
		}
	};

	const handlePrepForAI = async () => {
		if (!file) {
			setError('No file selected for AI preparation');
			return;
		}

		const fileName = file.name;
		setUploadMessage('Preparing file for AI processing...');

		try {
			const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
			const url = `https://us-central1-${projectId}.cloudfunctions.net/prepareFileForAI`;

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ fileName }),
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const result = await response.json();
			if (result.success) {
				setUploadMessage(`File processed successfully. Total chunks: ${result.totalChunks}, Total tokens: ${result.totalTokens}`);
			} else {
				setError(result.error || 'An error occurred during file processing');
			}
		} catch (error) {
			console.error('Error preparing file for AI:', error);
			setError('An error occurred while preparing the file for AI.');
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/background.jpg')" }}>
			<Header title="Upload Knowledge Base" userName={userName} showBackButton={true} />
			<main className="flex-grow flex flex-col items-center justify-center">
				<div className="text-center">
					<div className="flex flex-col items-center space-y-4 bg-opacity-75 bg-gray-800 p-6 rounded-lg shadow-lg">
						<input
							type="file"
							onChange={handleFileChange}
							className="hidden"
							ref={fileInputRef}
						/>
						<button
							onClick={handleChooseFile}
							className="bg-orange-500 text-white py-2 px-6 rounded-lg text-lg cursor-pointer hover:bg-orange-600"
						>
							Choose File
						</button>
						{file && <span className="text-white">{file.name}</span>}
						<button
							onClick={handleUpload}
							className="bg-orange-500 text-white py-2 px-6 rounded-lg text-lg hover:bg-orange-600"
							disabled={uploading || !file}
						>
							{uploading ? 'Uploading...' : 'Submit'}
						</button>
						{uploadSuccess && (
							<button
								onClick={handlePrepForAI}
								className="bg-orange-500 text-white py-2 px-6 rounded-lg text-lg hover:bg-orange-600"
							>
								Prep for AI
							</button>
						)}
					</div>
					{uploadMessage && (
						<div className="mt-8 text-white">
							<h2 className="text-2xl font-bold">{uploadMessage}</h2>
						</div>
					)}
					{error && <p className="text-red-500 mt-4">{error}</p>}
				</div>
			</main>
		</div>
	);
};

export default UploadPage;

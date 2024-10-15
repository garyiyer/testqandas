'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore, storage } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const UploadPage = () => {
	const [userName, setUserName] = useState<string | null>(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [files, setFiles] = useState<FileList | null>(null);
	const [uploadMessage, setUploadMessage] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const router = useRouter();

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

	const handleSignOut = async () => {
		await auth.signOut();
		router.push('/');
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFiles(e.target.files);
		setUploadMessage(null);
		setUploadSuccess(false);
	};

	const handleUpload = async () => {
		if (!files || files.length === 0) return;

		setUploading(true);
		setError(null);
		setUploadSuccess(false);

		try {
			const file = files[0];
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
		if (!files || files.length === 0) {
			setError('No file selected for AI preparation');
			return;
		}

		const fileName = files[0].name;
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
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
			style={{ backgroundImage: "url('/background.jpg')" }}
		>
			<div className="absolute top-4 left-4">
				<button
					className="bg-orange-500 text-white py-2 px-4 rounded-lg text-lg"
					onClick={() => router.push('/dashboard')}
				>
					← Dashboard
				</button>
			</div>
			<h1 className="text-5xl font-bold mb-10 text-gray-800">Upload Knowledge Base</h1>
			<div className="absolute top-4 right-4 flex items-center">
				<img
					src="/profile-pic.jpg"
					alt="Profile"
					className="w-10 h-10 rounded-full mr-2"
				/>
				<div className="relative">
					<button
						onClick={() => setDropdownOpen(!dropdownOpen)}
						className="text-lg font-semibold text-black"
					>
						{userName}
					</button>
					{dropdownOpen && (
						<div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
							<button
								onClick={handleSignOut}
								className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
							>
								Sign Out
							</button>
						</div>
					)}
				</div>
			</div>
			<div className="flex flex-col items-center space-y-4 bg-opacity-75 bg-gray-800 p-6 rounded-lg shadow-lg">
				<label className="bg-orange-500 text-white py-2 px-6 rounded-lg text-lg cursor-pointer">
					Choose File
					<input
						type="file"
						className="hidden"
						onChange={handleFileChange}
					/>
				</label>
				{files && files.length > 0 && (
					<span className="text-white">{files[0].name}</span>
				)}
				<button
					className="bg-orange-500 text-white py-2 px-6 rounded-lg text-lg"
					onClick={handleUpload}
					disabled={uploading || !files}
				>
					{uploading ? 'Uploading...' : 'Submit'}
				</button>
				{uploadSuccess && (
					<button
						onClick={handlePrepForAI}
						className="bg-orange-500 text-white py-2 px-6 rounded-lg text-lg"
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
			{error && <p className="text-red-500">{error}</p>}
		</div>
	);
};

export default UploadPage;

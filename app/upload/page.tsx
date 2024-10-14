'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase'; // Import auth from your firebase setup
import { onAuthStateChanged } from 'firebase/auth'; // Import directly from firebase/auth

export default function Upload() {
	const [userName, setUserName] = useState<string | null>(null);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [files, setFiles] = useState<FileList | null>(null);
	const [uploadMessage, setUploadMessage] = useState<string | null>(null);
	const router = useRouter();

	React.useEffect(() => {
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
		router.push('/'); // Redirect to the login page
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFiles(e.target.files);
		setUploadMessage(null);
	};

	const handleUpload = () => {
		if (files && files.length > 0) {
			setUploadMessage('Upload in progress...');
			// Simulate upload process
			setTimeout(() => {
				setUploadMessage(`File ${files[0].name} has been uploaded.`);
			}, 2000);
		}
	};

	return (
		<div
			className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
			style={{ backgroundImage: "url('/background.jpg')" }} // Placeholder background image
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
					src="/profile-pic.jpg" // Placeholder for profile picture
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
				>
					Submit
				</button>
			</div>
			{uploadMessage && (
				<div className="mt-8 text-white">
					<h2 className="text-2xl font-bold">{uploadMessage}</h2>
				</div>
			)}
		</div>
	);
}

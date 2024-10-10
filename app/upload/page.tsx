'use client';

import React, { useState, useEffect } from 'react';
import { storage, firestore } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const UploadPage = () => {
	const [user, setUser] = useState<User | null>(null);
	const [files, setFiles] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [processingMessage, setProcessingMessage] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});

		return () => unsubscribe();
	}, []);

	if (!user) {
		return <div>You must be logged in to upload files.</div>;
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const selectedFiles = Array.from(e.target.files);
			setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (files.length === 0) return;

		setUploading(true);
		setProgress([`Uploading ${files.length} files...`]);
		setError(null);
		setProcessingMessage(null);

		try {
			for (const file of files) {
				const storageRef = ref(storage, `uploads/${file.name}`);
				await uploadBytes(storageRef, file);
				const downloadURL = await getDownloadURL(storageRef);

				await addDoc(collection(firestore, 'uploads'), {
					fileName: file.name,
					fileURL: downloadURL,
					uploadedAt: new Date(),
				});
			}

			setProgress(prev => [...prev, 'All files uploaded successfully']);
			setProcessingMessage('Knowledge base created and ready to regenerate questions.');
		} catch (err) {
			console.error('Error uploading files:', err);
			const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
			setError(`An error occurred while uploading the files: ${errorMessage}`);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="upload-container">
			<h1 className="text-2xl font-bold">Upload Knowledge Base</h1>
			<form onSubmit={handleSubmit} className="mt-4">
				<input type="file" onChange={handleFileChange} multiple aria-label="upload file" />
				<button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Submit</button>
			</form>
			<div className="mt-4">
				<h2 className="text-lg font-semibold">Uploaded Files:</h2>
				<ul>
					{files.map((file, index) => (
						<li key={index}>{file.name}</li>
					))}
				</ul>
			</div>
			{uploading && <p>{progress.join(', ')}</p>}
			{error && <p style={{ color: 'red' }}>{error}</p>}
			{processingMessage && <p>{processingMessage}</p>}
		</div>
	);
};

export default UploadPage;

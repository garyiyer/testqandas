'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, storage, firestore } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, orderBy, setDoc, doc } from 'firebase/firestore';
import { Home, Book, HelpCircle, FileText, BarChart2, Settings, LogOut, Upload, Filter, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeBase() {
	const [userName, setUserName] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const [documents, setDocuments] = useState<any[]>([]);
	const [uploadMessage, setUploadMessage] = useState<string | null>(null);
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUserName(user.displayName || user.email?.split('@')[0] || 'User');
				fetchDocuments();
			} else {
				setUserName(null);
				setDocuments([]);
			}
		});

		return () => unsubscribe();
	}, []);

	const fetchDocuments = async () => {
		if (!auth.currentUser) {
			setDocuments([]);
			setError('Please log in to view your documents.');
			return;
		}
		
		try {
			const q = query(
				collection(firestore, 'files'),
				where('userId', '==', auth.currentUser.uid),
				orderBy('lastModified', 'desc')
			);
			const querySnapshot = await getDocs(q);
			const docs = await Promise.all(querySnapshot.docs.map(async (doc) => {
				const data = doc.data();
				let downloadURL = '';
				try {
					downloadURL = await getDownloadURL(ref(storage, `uploads/${data.name}`));
				} catch (error) {
					console.error('Error fetching download URL:', error);
				}
				return {
					id: doc.id,
					...data,
					downloadURL
				};
			}));
			setDocuments(docs);
			setError(null);
		} catch (error) {
			console.error('Error fetching documents:', error);
			if (error instanceof Error) {
				console.error('Error message:', error.message);
				console.error('Error code:', (error as any).code);
			}
			setDocuments([]);
			setError('Unable to fetch documents. Please try again later.');
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
			setUploadMessage(null);
			setUploadSuccess(false);
			setError(null);
		}
	};

	const handleUpload = async () => {
		if (!file) {
			setError('Please select a file to upload.');
			return;
		}

		setUploading(true);
		setError(null);
		setUploadMessage(null);

		try {
			const storageRef = ref(storage, `uploads/${file.name}`);
			await uploadBytes(storageRef, file);
			const downloadURL = await getDownloadURL(storageRef);

			const docRef = await addDoc(collection(firestore, 'files'), {
				name: file.name,
				type: file.type,
				size: file.size,
				lastModified: file.lastModified,
				downloadURL: downloadURL,
				userId: auth.currentUser?.uid,
			});

			setUploadSuccess(true);
			setUploadMessage('File uploaded successfully!');
			setFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
			fetchDocuments();
		} catch (error) {
			console.error('Error uploading file: ', error);
			setError('An error occurred while uploading the file. Please try again.');
		} finally {
			setUploading(false);
		}
	};

	const handlePrepForAI = async () => {
		// Implement your AI preparation logic here
		console.log('Preparing for AI...');
		setUploadMessage('File prepared for AI processing.');
	};

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar */}
			<div className="w-64 bg-[#1E293B] text-white">
				<div className="flex items-center p-4">
					<Book className="h-8 w-8 text-orange-500" />
					<span className="ml-2 text-xl font-bold">EduAI</span>
				</div>
				<nav className="mt-8">
					<NavItem href="/dashboard" icon={<Home size={20} />} text="Dashboard" />
					<NavItem href="/upload" icon={<Book size={20} />} text="Knowledge Base" active />
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
					<h1 className="text-2xl font-semibold text-gray-800">Knowledge Base</h1>
					<div className="flex items-center">
						<span className="text-gray-800 mr-2">{userName}</span>
						<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
							<span className="text-sm font-medium text-gray-600">{userName?.[0].toUpperCase()}</span>
						</div>
					</div>
				</header>

				{/* Main content area */}
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
					<div className="mb-4 flex justify-between items-start">
						<div className="flex flex-col items-start space-y-4">
							<div className="flex items-center space-x-4">
								<input
									type="file"
									onChange={handleFileChange}
									className="hidden"
									ref={fileInputRef}
								/>
								<button
									onClick={() => fileInputRef.current?.click()}
									className="bg-orange-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-orange-600"
								>
									<Upload className="h-5 w-5 mr-2" />
									Choose File
								</button>
								{file && <span className="text-gray-700">{file.name}</span>}
								<button
									onClick={handleUpload}
									className="bg-orange-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-orange-600"
									disabled={uploading || !file}
								>
									{uploading ? 'Uploading...' : 'Submit'}
								</button>
							</div>
							{uploadSuccess && (
								<button
									onClick={handlePrepForAI}
									className="bg-orange-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-orange-600"
								>
									Prep for AI
								</button>
							)}
							{error && <p className="text-red-500">{error}</p>}
							{uploadMessage && <p className="text-green-500">{uploadMessage}</p>}
						</div>
						<div className="flex items-center">
							<Filter className="h-5 w-5 mr-2 text-gray-500" />
							<select className="border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500">
								<option>All Types</option>
								<option>PDF</option>
								<option>DOCX</option>
							</select>
						</div>
					</div>

					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						{documents.length > 0 ? (
							documents.map((doc, index) => (
									<div key={doc.id} className={`flex justify-between items-center p-4 ${index !== 0 ? 'border-t' : ''}`}>
										<div>
											<h3 className="text-lg font-medium text-blue-600">{doc.name}</h3>
											<p className="text-sm text-gray-500">
												{doc.type} • Uploaded on {new Date(doc.lastModified).toLocaleDateString()}
											</p>
										</div>
										<div className="flex space-x-2">
											<button className="text-gray-400 hover:text-gray-500">
												<Edit size={20} />
											</button>
											<button className="text-gray-400 hover:text-gray-500">
												<Trash2 size={20} />
											</button>
										</div>
									</div>
							))
						) : (
							<p className="p-4 text-gray-500">No documents found.</p>
						)}
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


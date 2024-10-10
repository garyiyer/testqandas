import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from './page';

// Mock Firebase modules
jest.mock('../firebase', () => ({
  storage: {
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
  },
  firestore: {
    collection: jest.fn(),
    addDoc: jest.fn(),
  },
}));

// Mock React hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

describe('UploadPage', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useState for each state variable
    (React.useState as jest.Mock)
      .mockReturnValueOnce([null, jest.fn()]) // file state
      .mockReturnValueOnce([false, jest.fn()]) // uploading state
      .mockReturnValueOnce([[], jest.fn()]) // progress state
      .mockReturnValueOnce([null, jest.fn()]); // error state
  });

  it('renders the upload form', () => {
    render(<UploadPage />);
    expect(screen.getByLabelText(/upload file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  // Add more tests here...
});

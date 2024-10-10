import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from './page'
import '@testing-library/jest-dom'

// Mock the firebase auth
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
  },
}))

// Mock the SignInButton component
jest.mock('./components/SignInButton', () => () => <button>Sign In</button>)

// Mock the Next.js Link component
jest.mock('next/link', () => ({ children }) => children)

// Mock the useState and useEffect hooks
const mockSetState = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(() => [null, mockSetState]),
  useEffect: jest.fn(),
}))

describe('Home', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('renders a heading', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', {
      name: /welcome to my next\.js app with firebase!/i,
    })

    expect(heading).toBeInTheDocument()
  })

  it('shows not logged in message when user is null', () => {
    render(<Home />)

    const message = screen.getByText(/you are not logged in/i)

    expect(message).toBeInTheDocument()
  })
})

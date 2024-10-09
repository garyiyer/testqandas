import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from './page'

jest.mock('./firebase')  // Changed from '../firebase' to './firebase'

// Mock the useState and useEffect hooks
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn().mockReturnValue([null, jest.fn()]),
  useEffect: jest.fn(),
}))

describe('Home', () => {
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

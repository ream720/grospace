import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Welcome } from '../welcome/welcome'

describe('Welcome Component', () => {
  it('renders React Router content', () => {
    render(<Welcome />)
    expect(screen.getByText("What's next?")).toBeInTheDocument()
    expect(screen.getByText('React Router Docs')).toBeInTheDocument()
  })
})
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('h-12', 'w-12');
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<LoadingSpinner color="blue" />);
    let spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('border-blue-600');

    rerender(<LoadingSpinner color="white" />);
    spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('border-white');
  });

  it('applies correct text size based on spinner size', () => {
    const { rerender } = render(<LoadingSpinner size="sm" text="Small text" />);
    expect(screen.getByText('Small text')).toHaveClass('text-sm');

    rerender(<LoadingSpinner size="lg" text="Large text" />);
    expect(screen.getByText('Large text')).toHaveClass('text-lg');
  });

  it('has spinning animation', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner.firstChild).toHaveClass('animate-spin');
  });
});
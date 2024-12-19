// components/fact-checks/core/__tests__/FactCheckContent.test.js
import { render, screen } from '@testing-library/react';
import FactCheckContent from '../FactCheckContent';

describe('FactCheckContent', () => {
  const mockFactCheck = {
    submittedBy: 'user123',
    flaggedText: 'Test flagged text',
    context: 'Test context',
    source: 'https://test.com',
    moderatorNote: 'Test moderator note',
    moderatorSourceLink: 'https://moderator-source.com'
  };

  it('renders all fact check content correctly', () => {
    render(<FactCheckContent factCheck={mockFactCheck} />);

    // Use regex to find text that might be split across elements
    expect(screen.getByText(/Submitted by.*user123/)).toBeInTheDocument();
    expect(screen.getByText(mockFactCheck.flaggedText)).toBeInTheDocument();
    expect(screen.getByText(mockFactCheck.context)).toBeInTheDocument();
    
    const sourceLink = screen.getByRole('link', { name: mockFactCheck.source });
    expect(sourceLink).toBeInTheDocument();
    expect(sourceLink).toHaveAttribute('href', mockFactCheck.source);
  });

  it('renders moderator note when present', () => {
    render(<FactCheckContent factCheck={mockFactCheck} />);

    expect(screen.getByText('Moderator note:')).toBeInTheDocument();
    expect(screen.getByText(mockFactCheck.moderatorNote)).toBeInTheDocument();
  });

  it('does not render moderator note when absent', () => {
    const factCheckWithoutNote = {
      ...mockFactCheck,
      moderatorNote: undefined,
      moderatorSourceLink: undefined
    };

    render(<FactCheckContent factCheck={factCheckWithoutNote} />);

    expect(screen.queryByText('Moderator note:')).not.toBeInTheDocument();
  });

  it('renders moderator source link when present', () => {
    render(<FactCheckContent factCheck={mockFactCheck} />);

    const moderatorSourceLink = screen.getByRole('link', { name: 'Source' });
    expect(moderatorSourceLink).toHaveAttribute('href', mockFactCheck.moderatorSourceLink);
  });

  it('applies correct styling to elements', () => {
    render(<FactCheckContent factCheck={mockFactCheck} />);

    // Check for italic styling on flagged text
    const flaggedText = screen.getByText(mockFactCheck.flaggedText);
    expect(flaggedText).toHaveClass('italic', 'text-gray-700');

    // Check for link styling
    const sourceLink = screen.getByRole('link', { name: mockFactCheck.source });
    expect(sourceLink).toHaveClass('text-blue-500', 'hover:underline', 'break-all');
  });

  it('handles external links correctly', () => {
    render(<FactCheckContent factCheck={mockFactCheck} />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('handles missing optional fields gracefully', () => {
    const minimalFactCheck = {
      submittedBy: 'user123',
      flaggedText: 'Test flagged text',
      context: 'Test context',
      source: 'https://test.com'
    };

    render(<FactCheckContent factCheck={minimalFactCheck} />);
    
    expect(screen.getByText(minimalFactCheck.flaggedText)).toBeInTheDocument();
    expect(screen.queryByText('Moderator note:')).not.toBeInTheDocument();
  });

  it('renders long text content correctly', () => {
    const longTextFactCheck = {
      ...mockFactCheck,
      flaggedText: 'A'.repeat(200),
      context: 'B'.repeat(500)
    };

    render(<FactCheckContent factCheck={longTextFactCheck} />);

    expect(screen.getByText('A'.repeat(200))).toBeInTheDocument();
    expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
  });
});
// components/fact-checks/core/__tests__/FactCheckVoting.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import FactCheckVoting from '../FactCheckVoting';

describe('FactCheckVoting', () => {
  const defaultProps = {
    upvotes: 5,
    downvotes: 2,
    currentUserVote: 0,
    onVote: jest.fn(),
    factCheckId: 'test-id',
    user: { uid: 'test-user' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders vote counts correctly', () => {
    render(<FactCheckVoting {...defaultProps} />);

    const upvoteSpan = screen.getAllByText('5')[0]; // Get first occurrence
    const downvoteSpan = screen.getByText('2');
    
    expect(upvoteSpan).toBeInTheDocument();
    expect(downvoteSpan).toBeInTheDocument();
  });

  it('handles upvote click', () => {
    render(<FactCheckVoting {...defaultProps} />);

    const upvoteButton = screen.getByLabelText('Vote up');
    fireEvent.click(upvoteButton);

    expect(defaultProps.onVote).toHaveBeenCalledWith('test-id', 1);
  });

  it('handles downvote click', () => {
    render(<FactCheckVoting {...defaultProps} />);

    const downvoteButton = screen.getByLabelText('Vote down');
    fireEvent.click(downvoteButton);

    expect(defaultProps.onVote).toHaveBeenCalledWith('test-id', -1);
  });

  it('disables voting when no user is logged in', () => {
    render(<FactCheckVoting {...defaultProps} user={null} />);

    const upvoteButton = screen.getByLabelText('Vote up');
    const downvoteButton = screen.getByLabelText('Vote down');

    expect(upvoteButton).toBeDisabled();
    expect(downvoteButton).toBeDisabled();
  });

  it('highlights current user vote', () => {
    const { rerender } = render(
      <FactCheckVoting {...defaultProps} currentUserVote={1} />
    );

    expect(screen.getByLabelText('Vote up')).toHaveClass('bg-blue-100');
    expect(screen.getByLabelText('Vote down')).not.toHaveClass('bg-blue-100');

    // Test downvote highlight
    rerender(<FactCheckVoting {...defaultProps} currentUserVote={-1} />);

    expect(screen.getByLabelText('Vote up')).not.toHaveClass('bg-blue-100');
    expect(screen.getByLabelText('Vote down')).toHaveClass('bg-blue-100');
  });

  it('removes vote when clicking the same button again', () => {
    render(<FactCheckVoting {...defaultProps} currentUserVote={1} />);

    const upvoteButton = screen.getByLabelText('Vote up');
    fireEvent.click(upvoteButton);

    expect(defaultProps.onVote).toHaveBeenCalledWith('test-id', 0);
  });

  it('changes vote when clicking different button', () => {
    render(<FactCheckVoting {...defaultProps} currentUserVote={1} />);

    const downvoteButton = screen.getByLabelText('Vote down');
    fireEvent.click(downvoteButton);

    expect(defaultProps.onVote).toHaveBeenCalledWith('test-id', -1);
  });

  it('applies correct colors based on vote difference', () => {
    // Test positive difference
    const { rerender } = render(
      <FactCheckVoting {...defaultProps} upvotes={10} downvotes={2} />
    );

    let votes = screen.getAllByText('10');
    expect(votes[0]).toHaveClass('text-green-600');

    // Test negative difference
    rerender(<FactCheckVoting {...defaultProps} upvotes={2} downvotes={10} />);
    votes = screen.getAllByText('2');
    expect(votes[0]).toHaveClass('text-red-600');

    // Test neutral
    rerender(<FactCheckVoting {...defaultProps} upvotes={5} downvotes={5} />);
    votes = screen.getAllByText('5');
    expect(votes[0]).toHaveClass('text-gray-600');
  });

  it('renders in correct vertical layout', () => {
    const { container } = render(<FactCheckVoting {...defaultProps} />);

    const votingContainer = container.querySelector('.flex.flex-col.items-center');
    expect(votingContainer).toBeInTheDocument();
  });

  it('handles transition styles correctly', () => {
    render(<FactCheckVoting {...defaultProps} />);

    const upvoteButton = screen.getByLabelText('Vote up');
    const downvoteButton = screen.getByLabelText('Vote down');

    expect(upvoteButton).toHaveClass('transition-colors');
    expect(downvoteButton).toHaveClass('transition-colors');
  });

  it('handles hover states correctly', () => {
    render(<FactCheckVoting {...defaultProps} />);

    const upvoteButton = screen.getByLabelText('Vote up');
    const downvoteButton = screen.getByLabelText('Vote down');

    expect(upvoteButton).toHaveClass('hover:bg-gray-100');
    expect(downvoteButton).toHaveClass('hover:bg-gray-100');
  });

  it('handles zero votes correctly', () => {
    const { container } = render(
      <FactCheckVoting {...defaultProps} upvotes={0} downvotes={0} />
    );

    const upvotes = container.querySelector('.flex.flex-col.items-center span:first-child');
    const downvotes = container.querySelector('.flex.flex-col.items-center span:last-child');

    expect(upvotes).toHaveClass('text-gray-600');
    expect(downvotes).toHaveClass('text-gray-600');
  });

  it('renders separating slash correctly', () => {
    render(<FactCheckVoting {...defaultProps} />);
    
    const separator = screen.getByText('/');
    expect(separator).toHaveClass('text-xs', 'text-gray-400', 'mx-1');
  });

  it('has correct button sizes', () => {
    const { container } = render(<FactCheckVoting {...defaultProps} />);

    const upvoteIcon = container.querySelector('.lucide-arrow-up');
    const downvoteIcon = container.querySelector('.lucide-arrow-down');

    expect(upvoteIcon).toHaveAttribute('width', '20');
    expect(upvoteIcon).toHaveAttribute('height', '20');
    expect(downvoteIcon).toHaveAttribute('width', '20');
    expect(downvoteIcon).toHaveAttribute('height', '20');
  });
});
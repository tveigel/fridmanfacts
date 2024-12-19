// src/components/fact-checks/core/__tests__/FactCheck.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FactCheck from '../FactCheck';
import { useAuth } from '../../../../lib/context/AuthContext';
import { useModeration } from '../../../../hooks/useModeration';
import { useRoles } from '../../../../hooks/useRoles';
import { factCheckService, notificationService } from '../../../../lib/services';

// Mock all the hooks and services
jest.mock('../../../../lib/context/AuthContext');
jest.mock('../../../../hooks/useModeration');
jest.mock('../../../../hooks/useRoles');
jest.mock('../../../../lib/services/factCheckService');
jest.mock('../../../../lib/services/notificationService');

describe('FactCheck', () => {
  const mockFactCheck = {
    id: 'test-id',
    flaggedText: 'Test flagged text',
    submittedBy: 'user123',
    context: 'Test context',
    source: 'https://test.com',
    status: 'UNVALIDATED',
    upvotes: 5,
    downvotes: 2,
    episodeId: 'episode123'
  };

  const mockUser = { uid: 'test-user' };
  const mockOnVote = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up default mock implementations
    useAuth.mockReturnValue({ user: mockUser });
    useModeration.mockReturnValue({ isModerator: false });
    useRoles.mockReturnValue({ isModerator: false });

    factCheckService.updateFactCheck.mockResolvedValue();
    notificationService.createNotification.mockResolvedValue();
    factCheckService.deleteFactCheck.mockResolvedValue();
  });

  it('renders basic fact check content', () => {
    render(
      <FactCheck 
        factCheck={mockFactCheck}
        onVote={mockOnVote}
        userVotes={{}}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(mockFactCheck.flaggedText)).toBeInTheDocument();
    expect(screen.getByText(mockFactCheck.context)).toBeInTheDocument();
    expect(screen.getByText(mockFactCheck.source)).toBeInTheDocument();
  });

  it('handles voting when user is logged in', async () => {
    render(
      <FactCheck 
        factCheck={mockFactCheck}
        onVote={mockOnVote}
        userVotes={{}}
        onDelete={mockOnDelete}
      />
    );

    const upvoteButton = screen.getByLabelText('Vote up');
    fireEvent.click(upvoteButton);

    expect(mockOnVote).toHaveBeenCalledWith(mockFactCheck.id, 1);
  });

  it('disables voting when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <FactCheck 
        factCheck={mockFactCheck}
        onVote={mockOnVote}
        userVotes={{}}
        onDelete={mockOnDelete}
      />
    );

    const upvoteButton = screen.getByLabelText('Vote up');
    expect(upvoteButton).toBeDisabled();
  });

  describe('Moderator functionality', () => {
    beforeEach(() => {
      useModeration.mockReturnValue({ isModerator: true });
      factCheckService.updateFactCheck.mockResolvedValue();
      notificationService.createNotification.mockResolvedValue();
    });

    it('shows moderator controls when user is moderator', () => {
      render(
        <FactCheck 
          factCheck={mockFactCheck}
          onVote={mockOnVote}
          userVotes={{}}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Validate')).toBeInTheDocument();
      expect(screen.getByText('Mark False')).toBeInTheDocument();
      expect(screen.getByText('Mark Controversial')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('handles validation correctly', async () => {
      render(
        <FactCheck 
          factCheck={mockFactCheck}
          onVote={mockOnVote}
          userVotes={{}}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByText('Validate'));

      await waitFor(() => {
        expect(factCheckService.updateFactCheck).toHaveBeenCalledWith(
          mockFactCheck.id,
          expect.objectContaining({
            moderatorValidation: 'VALIDATED_TRUE',
            moderatedBy: mockUser.uid
          })
        );
      });
    });

    it('handles deletion flow correctly', async () => {
      render(
        <FactCheck 
          factCheck={mockFactCheck}
          onVote={mockOnVote}
          userVotes={{}}
          onDelete={mockOnDelete}
        />
      );

      // Click the delete button to open the modal
      fireEvent.click(screen.getByText('Delete'));

      // Enter deletion reason
      const reasonInput = screen.getByTestId('delete-reason-input');
      fireEvent.change(reasonInput, { target: { value: 'Test deletion reason' } });

      // Confirm deletion
      fireEvent.click(screen.getByTestId('confirm-delete-button'));

      await waitFor(() => {
        expect(factCheckService.deleteFactCheck).toHaveBeenCalledWith(
          mockFactCheck.id,
          mockFactCheck.episodeId
        );
        expect(notificationService.createNotification).toHaveBeenCalled();
        expect(mockOnDelete).toHaveBeenCalledWith(mockFactCheck.id);
      });
    });

    it('creates notification when marking as false', async () => {
      render(
        <FactCheck 
          factCheck={mockFactCheck}
          onVote={mockOnVote}
          userVotes={{}}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByText('Mark False'));

      // The ModeratorCommentModal should appear
      const commentTextarea = await screen.findByPlaceholderText('Enter your comment here...');
      fireEvent.change(commentTextarea, { target: { value: 'Test comment' } });

      fireEvent.click(screen.getByText('Mark as False'));

      await waitFor(() => {
        expect(factCheckService.updateFactCheck).toHaveBeenCalledWith(
          mockFactCheck.id,
          expect.objectContaining({
            moderatorValidation: 'VALIDATED_FALSE',
            moderatorNote: 'Test comment'
          })
        );
        expect(notificationService.createNotification).toHaveBeenCalled();
      });
    });
  });

  describe('Vote display', () => {
    it('displays correct vote counts', () => {
      render(
        <FactCheck 
          factCheck={mockFactCheck}
          onVote={mockOnVote}
          userVotes={{}}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('5')).toBeInTheDocument(); // upvotes
      expect(screen.getByText('2')).toBeInTheDocument(); // downvotes
    });

    it('highlights user\'s previous vote', () => {
      render(
        <FactCheck 
          factCheck={mockFactCheck}
          onVote={mockOnVote}
          userVotes={{ [mockFactCheck.id]: 1 }}
          onDelete={mockOnDelete}
        />
      );

      const upvoteButton = screen.getByLabelText('Vote up');
      expect(upvoteButton).toHaveClass('bg-blue-100');
    });
  });
});

// components/fact-checks/core/__tests__/ModeratorControls.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import ModeratorControls from '../ModeratorControls';

describe('ModeratorControls', () => {
  const mockOnValidate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all control buttons', () => {
    render(<ModeratorControls onValidate={mockOnValidate} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Validate')).toBeInTheDocument();
    expect(screen.getByText('Mark False')).toBeInTheDocument();
    expect(screen.getByText('Mark Controversial')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onValidate with correct status when buttons are clicked', () => {
    render(<ModeratorControls onValidate={mockOnValidate} onDelete={mockOnDelete} />);
    
    fireEvent.click(screen.getByText('Validate'));
    expect(mockOnValidate).toHaveBeenCalledWith('VALIDATED_TRUE');

    fireEvent.click(screen.getByText('Mark False'));
    expect(mockOnValidate).toHaveBeenCalledWith('VALIDATED_FALSE');

    fireEvent.click(screen.getByText('Mark Controversial'));
    expect(mockOnValidate).toHaveBeenCalledWith('VALIDATED_CONTROVERSIAL');
  });

  it('handles deletion flow correctly', () => {
    render(<ModeratorControls onValidate={mockOnValidate} onDelete={mockOnDelete} />);
    
    // Open delete modal
    fireEvent.click(screen.getByText('Delete'));
    
    // Enter deletion reason
    const reasonInput = screen.getByTestId('delete-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Test deletion reason' } });
    
    // Confirm deletion
    fireEvent.click(screen.getByTestId('confirm-delete-button'));
    
    expect(mockOnDelete).toHaveBeenCalledWith('Test deletion reason');
  });

  it('applies correct styling to buttons', () => {
    render(<ModeratorControls onValidate={mockOnValidate} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Validate')).toHaveClass('bg-green-100');
    expect(screen.getByText('Mark False')).toHaveClass('bg-red-100');
    expect(screen.getByText('Mark Controversial')).toHaveClass('bg-yellow-100');
    expect(screen.getByText('Delete')).toHaveClass('bg-red-100');
  });
});
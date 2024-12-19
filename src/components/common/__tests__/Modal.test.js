// components/common/__tests__/Modal.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    // Reset mock function
    mockOnClose.mockClear();
    
    // Mock document.body.style manipulation
    Object.defineProperty(document.body.style, 'overflow', {
      configurable: true,
      get() { return this._overflow; },
      set(value) { this._overflow = value; }
    });
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClose when clicking the backdrop', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    // Find backdrop by its class instead of role
    const backdrop = document.querySelector('.bg-black.bg-opacity-50');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('prevents event propagation when clicking modal content', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    // Find the modal content container
    const modalContent = document.querySelector('.bg-white.rounded-lg');
    expect(modalContent).toBeInTheDocument();
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('disables body scroll when modal is open', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });

  it('enables body scroll when modal is closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('unset');
  });

  it('restores body scroll on unmount', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('unset');
  });

  // New test to verify modal is properly centered
  it('centers modal content', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    const centerContainer = document.querySelector('.flex.items-center.justify-center');
    expect(centerContainer).toBeInTheDocument();
  });

  // New test to verify modal has proper z-index
  it('renders with correct z-index', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Test Content</div>
      </Modal>
    );

    const modalContainer = document.querySelector('.z-50');
    expect(modalContainer).toBeInTheDocument();
  });
});
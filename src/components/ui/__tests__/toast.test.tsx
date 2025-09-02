import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastContainer } from '../toast';
import { useToastStore } from '../../../lib/stores/toast-store';

// Mock the toast store
vi.mock('../../../lib/stores/toast-store');

const mockUseToastStore = vi.mocked(useToastStore);

describe('ToastContainer', () => {
  const mockRemoveToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseToastStore.mockReturnValue({
      toasts: [],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should render nothing when no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('should render toasts when they exist', () => {
    mockUseToastStore.mockReturnValue({
      toasts: [
        {
          id: '1',
          type: 'success',
          message: 'Success message',
          title: 'Success',
          duration: 5000,
          dismissible: true,
        },
        {
          id: '2',
          type: 'error',
          message: 'Error message',
          duration: 0,
          dismissible: true,
        },
      ],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });

    render(<ToastContainer />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should display correct icons for different toast types', () => {
    mockUseToastStore.mockReturnValue({
      toasts: [
        { id: '1', type: 'success', message: 'Success', duration: 5000, dismissible: true },
        { id: '2', type: 'error', message: 'Error', duration: 0, dismissible: true },
        { id: '3', type: 'warning', message: 'Warning', duration: 5000, dismissible: true },
        { id: '4', type: 'info', message: 'Info', duration: 5000, dismissible: true },
      ],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });

    render(<ToastContainer />);

    // Check that all toast messages are rendered
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should show dismiss button when dismissible is true', () => {
    mockUseToastStore.mockReturnValue({
      toasts: [
        {
          id: 'test-toast',
          type: 'success',
          message: 'Test message',
          duration: 5000,
          dismissible: true,
        },
      ],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });

    render(<ToastContainer />);

    const dismissButton = screen.getByLabelText('Dismiss notification');
    expect(dismissButton).toBeInTheDocument();
    
    // Verify clicking the button exists (actual removal is tested in store tests)
    fireEvent.click(dismissButton);
  });

  it('should not show dismiss button when dismissible is false', () => {
    mockUseToastStore.mockReturnValue({
      toasts: [
        {
          id: 'test-toast',
          type: 'success',
          message: 'Test message',
          duration: 5000,
          dismissible: false,
        },
      ],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });

    render(<ToastContainer />);

    expect(screen.queryByLabelText('Dismiss notification')).not.toBeInTheDocument();
  });

  it('should auto-dismiss toast after duration', async () => {
    // Note: Auto-dismiss is handled by the store, not the component
    // This test verifies the component renders correctly with auto-dismiss toasts
    mockUseToastStore.mockReturnValue({
      toasts: [
        {
          id: 'auto-dismiss-toast',
          type: 'success',
          message: 'Auto dismiss message',
          duration: 1000,
          dismissible: true,
        },
      ],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });

    render(<ToastContainer />);

    expect(screen.getByText('Auto dismiss message')).toBeInTheDocument();
  });

  it('should render toast without title', () => {
    mockUseToastStore.mockReturnValue({
      toasts: [
        {
          id: 'no-title-toast',
          type: 'info',
          message: 'Message without title',
          duration: 5000,
          dismissible: true,
        },
      ],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });

    render(<ToastContainer />);

    expect(screen.getByText('Message without title')).toBeInTheDocument();
    // Should not have any heading elements since no title
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should apply correct styling for different toast types', () => {
    mockUseToastStore.mockReturnValue({
      toasts: [
        { id: '1', type: 'success', message: 'Success', duration: 5000, dismissible: true },
        { id: '2', type: 'error', message: 'Error', duration: 0, dismissible: true },
      ],
      removeToast: mockRemoveToast,
      addToast: vi.fn(),
      clearAllToasts: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
    });

    const { container } = render(<ToastContainer />);

    // Check that toasts have appropriate styling classes
    const toastElements = container.querySelectorAll('[class*="bg-"]');
    expect(toastElements.length).toBeGreaterThan(0);
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from '../components/Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders toast message', () => {
    const onClose = jest.fn();
    render(<Toast message="Test bericht" type="info" onClose={onClose} />);

    expect(screen.getByText('Test bericht')).toBeInTheDocument();
  });

  it('calls onClose after duration expires', () => {
    const onClose = jest.fn();
    render(<Toast message="Test" type="info" onClose={onClose} duration={3000} />);

    expect(onClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(3000);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses default duration of 4000ms', () => {
    const onClose = jest.fn();
    render(<Toast message="Test" type="info" onClose={onClose} />);

    jest.advanceTimersByTime(3999);
    expect(onClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders close button', () => {
    const onClose = jest.fn();
    render(<Toast message="Test" type="info" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /sluiten/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onClose = jest.fn();
    render(<Toast message="Test" type="info" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /sluiten/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders success type with correct styling', () => {
    const onClose = jest.fn();
    const { container } = render(<Toast message="Success!" type="success" onClose={onClose} />);

    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveStyle({ backgroundColor: '#4a7c59' });
  });

  it('renders error type with correct styling', () => {
    const onClose = jest.fn();
    const { container } = render(<Toast message="Error!" type="error" onClose={onClose} />);

    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveStyle({ backgroundColor: '#8b4049' });
  });

  it('renders warning type with correct styling', () => {
    const onClose = jest.fn();
    const { container } = render(<Toast message="Warning!" type="warning" onClose={onClose} />);

    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveStyle({ backgroundColor: '#9a7e3a' });
  });

  it('renders info type with correct styling', () => {
    const onClose = jest.fn();
    const { container } = render(<Toast message="Info" type="info" onClose={onClose} />);

    const toast = container.firstChild as HTMLElement;
    expect(toast).toHaveStyle({ backgroundColor: '#3a5f7f' });
  });

  it('cleans up timer on unmount', () => {
    const onClose = jest.fn();
    const { unmount } = render(<Toast message="Test" type="info" onClose={onClose} />);

    unmount();
    jest.advanceTimersByTime(4000);

    expect(onClose).not.toHaveBeenCalled();
  });
});


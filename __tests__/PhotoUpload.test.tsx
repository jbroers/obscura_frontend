import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoUpload from '../components/PhotoUpload';

// Mock fetch
global.fetch = jest.fn();

describe('PhotoUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ backendUrl: 'http://localhost:8080', maxFileSizeBytes: 10485760 }),
    });
  });

  it('renders upload button', async () => {
    render(<PhotoUpload />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /kies foto/i })).toBeInTheDocument();
    });
  });

  it('fetches backend configuration on mount', async () => {
    render(<PhotoUpload />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/config');
    });
  });

  it('disables upload button when no backend URL is available', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    render(<PhotoUpload />);

    const selectButton = screen.getByRole('button', { name: /kies foto/i });
    expect(selectButton).toBeDisabled();
  });

  it('enables upload button when backend URL is loaded', async () => {
    render(<PhotoUpload />);

    await waitFor(() => {
      const selectButton = screen.getByRole('button', { name: /kies foto/i });
      expect(selectButton).not.toBeDisabled();
    });
  });

  it('shows file input element', () => {
    render(<PhotoUpload />);

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('accepts image file formats', () => {
    render(<PhotoUpload />);

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    const acceptAttr = fileInput.getAttribute('accept');

    expect(acceptAttr).toContain('.jpg');
    expect(acceptAttr).toContain('.png');
    expect(acceptAttr).toContain('.cr2');
    expect(acceptAttr).toContain('.nef');
  });

  it('calls onUploadSuccess callback after successful upload', async () => {
    const mockCallback = jest.fn();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080', maxFileSizeBytes: 10485760 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Success',
      });

    render(<PhotoUpload onUploadSuccess={mockCallback} />);

    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = document.getElementById('file-input') as HTMLInputElement;

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /kies foto/i })).not.toBeDisabled();
    });

    await userEvent.upload(fileInput, file);

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});


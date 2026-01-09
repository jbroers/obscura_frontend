/// <reference types="jest" />
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoUpload from '../components/PhotoUpload';
import '@testing-library/jest-dom';

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
      expect(screen.getByRole('button', { name: /kies foto.*max 10/i })).toBeInTheDocument();
    });
  });

  it('fetches backend configuration on mount', async () => {
    render(<PhotoUpload />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/config');
    });
  });

  it('disables upload button when no backend URL is available', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    render(<PhotoUpload />);

    await waitFor(() => {
      const selectButton = screen.getByRole('button', { name: /kies foto.*max 10/i });
      expect(selectButton).toBeDisabled();
    });
  });

  it('enables upload button when backend URL is loaded', async () => {
    render(<PhotoUpload />);

    await waitFor(() => {
      const selectButton = screen.getByRole('button', { name: /kies foto.*max 10/i });
      expect(selectButton).not.toBeDisabled();
    });
  });

  it('shows file input element with multiple attribute', async () => {
    render(<PhotoUpload />);

    await waitFor(() => {
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('multiple');
    });
  });

  it('accepts image file formats', async () => {
    render(<PhotoUpload />);

    await waitFor(() => {
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      const acceptAttr = fileInput.getAttribute('accept');

      expect(acceptAttr).toContain('.jpg');
      expect(acceptAttr).toContain('.png');
      expect(acceptAttr).toContain('.cr2');
      expect(acceptAttr).toContain('.nef');
    });
  });

  it('calls onUploadSuccess callback after successful batch upload', async () => {
    const mockCallback = jest.fn();
    const user = userEvent.setup();

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080', maxFileSizeBytes: 10485760 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Successfully uploaded 3 photo(s)',
          photos: [{}, {}, {}]
        }),
      });

    render(<PhotoUpload onUploadSuccess={mockCallback} />);

    const files = [
      new File(['dummy1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['dummy2'], 'test2.jpg', { type: 'image/jpeg' }),
      new File(['dummy3'], 'test3.jpg', { type: 'image/jpeg' }),
    ];

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /kies foto.*max 10/i })).not.toBeDisabled();
    });

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    await user.upload(fileInput, files);

    await waitFor(() => {
      expect(screen.getByText(/3 foto's geselecteerd/i)).toBeInTheDocument();
    });

    const uploadButton = screen.getByRole('button', { name: /upload 3 foto's/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  it('limits batch upload to 10 files maximum', async () => {
    const user = userEvent.setup();

    render(<PhotoUpload />);

    const files = Array.from({ length: 15 }, (_, i) =>
      new File([`dummy${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /kies foto.*max 10/i })).not.toBeDisabled();
    });

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    await user.upload(fileInput, files);

    // Should show error toast about max 10 files, so no files should be selected
    await waitFor(() => {
      expect(screen.queryByText(/15 foto's geselecteerd/i)).not.toBeInTheDocument();
    });
  });
});


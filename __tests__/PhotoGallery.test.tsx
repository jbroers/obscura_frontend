import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PhotoGallery from '../components/PhotoGallery';

// Mock fetch
global.fetch = jest.fn();

describe('PhotoGallery Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ backendUrl: 'http://localhost:8080' }),
    });

    render(<PhotoGallery />);

    expect(screen.getByText(/foto's laden/i)).toBeInTheDocument();
  });

  it('fetches backend configuration from /api/config first', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<PhotoGallery />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/config');
    });
  });

  it('falls back to config.json if /api/config fails', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('API not found'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<PhotoGallery />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/config.json');
    });
  });

  it('displays message when no photos are available', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<PhotoGallery />);

    await waitFor(() => {
      expect(screen.getByText(/nog geen foto's gevonden/i)).toBeInTheDocument();
    });
  });

  it('renders photos when available', async () => {
    const mockPhotos = [
      {
        id: 1,
        fileName: 'test1.jpg',
        fileUrl: 'http://localhost:8080/photos/1',
        fileSize: 1024000,
        contentType: 'image/jpeg',
        uploadedAt: '2026-01-09T12:00:00',
        aperture: 'f/2.8',
        shutterSpeed: '1/250',
        iso: 400,
        isRaw: false,
      },
      {
        id: 2,
        fileName: 'test2.jpg',
        fileUrl: 'http://localhost:8080/photos/2',
        fileSize: 2048000,
        contentType: 'image/jpeg',
        uploadedAt: '2026-01-09T12:00:00',
        aperture: 'f/4.0',
        shutterSpeed: '1/500',
        iso: 200,
        isRaw: false,
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPhotos,
      });

    render(<PhotoGallery />);

    await waitFor(() => {
      expect(screen.getByText(/foto galerij/i)).toBeInTheDocument();
    });

    const images = screen.getAllByRole('img');
    // Filter out Bootstrap icons
    const photoImages = images.filter(img => img.getAttribute('src')?.startsWith('http'));
    expect(photoImages.length).toBeGreaterThanOrEqual(2);
  });

  it('displays photo metadata correctly', async () => {
    const mockPhoto = {
      id: 1,
      fileName: 'test.jpg',
      fileUrl: 'http://localhost:8080/photos/1',
      fileSize: 1024000,
      contentType: 'image/jpeg',
      uploadedAt: '2026-01-09T12:00:00',
      aperture: 'f/2.8',
      shutterSpeed: '1/250',
      iso: 400,
      isRaw: false,
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockPhoto],
      });

    render(<PhotoGallery />);

    await waitFor(() => {
      expect(screen.getByText('f/2.8')).toBeInTheDocument();
      expect(screen.getByText('1/250')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();
    });
  });

  it('refetches photos when refreshTrigger changes', async () => {
    const mockPhotos = [
      {
        id: 1,
        fileName: 'test.jpg',
        fileUrl: 'http://localhost:8080/photos/1',
        fileSize: 1024000,
        contentType: 'image/jpeg',
        uploadedAt: '2026-01-09T12:00:00',
        isRaw: false,
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080' }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => mockPhotos,
      });

    const { rerender } = render(<PhotoGallery refreshTrigger={1} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/photos');
    });

    const callCount = (global.fetch as jest.Mock).mock.calls.length;

    rerender(<PhotoGallery refreshTrigger={2} />);

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(callCount);
    });
  });

  it('handles fetch errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ backendUrl: 'http://localhost:8080' }),
      })
      .mockRejectedValueOnce(new Error('Network error'));

    render(<PhotoGallery />);

    await waitFor(() => {
      expect(screen.getByText(/nog geen foto's gevonden/i)).toBeInTheDocument();
    });
  });
});


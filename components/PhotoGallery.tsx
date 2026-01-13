"use client";

import React, { useState, useEffect } from 'react';
import Toast, { ToastType } from './Toast';

interface PhotoMetadataDto {
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
    cameraMake?: string;
    cameraModel?: string;
    lensModel?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
    resolution?: string;
    dateTaken?: string;
    isRaw: boolean;
    gpsLatitude?: number;
    gpsLongitude?: number;
    orientation?: number;
}

interface SearchFilters {
    make?: string;
    model?: string;
    lens?: string;
    isRaw?: boolean;
    startDate?: string;
    endDate?: string;
}

interface PhotoGalleryProps {
    refreshTrigger?: number;
}

interface ToastMessage {
    message: string;
    type: ToastType;
    id: number;
}


export default function PhotoGallery({ refreshTrigger }: Readonly<PhotoGalleryProps>) {
    const [photos, setPhotos] = useState<PhotoMetadataDto[]>([]);
    const [filteredPhotos, setFilteredPhotos] = useState<PhotoMetadataDto[]>([]);
    const [backendUrl, setBackendUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [lightboxPhoto, setLightboxPhoto] = useState<PhotoMetadataDto | null>(null);

    const [filters, setFilters] = useState<SearchFilters>({});
    const [cameraMakes, setCameraMakes] = useState<string[]>([]);
    const [cameraModels, setCameraModels] = useState<string[]>([]);
    const [lensModels, setLensModels] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/config')
            .then(res => {
                if (!res.ok) throw new Error('no-backend-config');
                return res.json();
            })
            .then(data => {
                if (data.backendUrl) setBackendUrl(data.backendUrl);
            })
            .catch(() => {
                fetch('/config.json')
                    .then(res => res.json())
                    .then(data => {
                        if (data.backendUrl) setBackendUrl(data.backendUrl);
                    })
                    .catch(() => {
                        showToast('Configuratie kon niet worden geladen', 'error');
                    });
            });
    }, []);

    useEffect(() => {
        if (!backendUrl) return;
        fetchPhotos();
    }, [backendUrl, refreshTrigger]);

    useEffect(() => {
        const makes = Array.from(new Set(photos.map(p => p.cameraMake).filter(Boolean)));
        const models = Array.from(new Set(photos.map(p => p.cameraModel).filter(Boolean)));
        const lenses = Array.from(new Set(photos.map(p => p.lensModel).filter(Boolean)));

        setCameraMakes(makes as string[]);
        setCameraModels(models as string[]);
        setLensModels(lenses as string[]);
    }, [photos]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && lightboxPhoto) {
                setLightboxPhoto(null);
            }
        };

        globalThis.addEventListener('keydown', handleEscape);
        return () => globalThis.removeEventListener('keydown', handleEscape);
    }, [lightboxPhoto]);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchPhotos = async () => {
        if (!backendUrl) return;

        setLoading(true);
        try {
            const endpoint = `${backendUrl}/photos`;

            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                console.log('Received photos from backend:', data);
                console.log('First photo raw data:', JSON.stringify(data[0], null, 2));

                const normalizedData = data.map((photo: any) => ({
                    id: photo.id,
                    fileName: photo.fileName || photo.filename || photo.file_name || '',
                    fileUrl: photo.fileUrl || photo.url || photo.file_url || '',
                    fileSize: photo.fileSize || photo.file_size || 0,
                    contentType: photo.contentType || photo.content_type || '',
                    uploadedAt: photo.uploadedAt || photo.uploaded_at || '',
                    cameraMake: photo.cameraMake || photo.camera_make || '',
                    cameraModel: photo.cameraModel || photo.camera_model || '',
                    lensModel: photo.lensModel || photo.lens_model || '',
                    iso: photo.iso,
                    aperture: photo.aperture,
                    shutterSpeed: photo.shutterSpeed || photo.shutter_speed || '',
                    focalLength: photo.focalLength || photo.focal_length || '',
                    resolution: photo.resolution,
                    dateTaken: photo.dateTaken || photo.date_taken || '',
                    isRaw: photo.isRaw || photo.is_raw || false,
                    gpsLatitude: photo.gpsLatitude || photo.gps_latitude,
                    gpsLongitude: photo.gpsLongitude || photo.gps_longitude,
                    orientation: photo.orientation
                }));

                console.log('First normalized photo:', normalizedData[0]);

                const filtered = applyClientSideFilters(normalizedData);

                setPhotos(normalizedData);
                setFilteredPhotos(filtered);
            } else {
                showToast('Fout bij ophalen foto\'s', 'error');
            }
        } catch {
            showToast('Netwerkfout bij ophalen foto\'s', 'error');
        } finally {
            setLoading(false);
        }
    };

    const matchesTextFilter = (value: string | undefined, filterValue: string): boolean => {
        return !filterValue || (value?.toLowerCase().includes(filterValue.toLowerCase()) ?? false);
    };

    const matchesDateRange = (photo: PhotoMetadataDto): boolean => {
        if (!photo.dateTaken) return true;

        const photoDate = new Date(photo.dateTaken);

        if (filters.startDate && photoDate < new Date(filters.startDate)) {
            return false;
        }

        if (filters.endDate && photoDate > new Date(filters.endDate)) {
            return false;
        }

        return true;
    };

    const applyClientSideFilters = (photosList: PhotoMetadataDto[]): PhotoMetadataDto[] => {
        return photosList.filter(photo => {
            if (!matchesTextFilter(photo.cameraMake, filters.make || '')) return false;
            if (!matchesTextFilter(photo.cameraModel, filters.model || '')) return false;
            if (!matchesTextFilter(photo.lensModel, filters.lens || '')) return false;
            if (filters.isRaw !== undefined && photo.isRaw !== filters.isRaw) return false;
            if (!matchesDateRange(photo)) return false;

            return true;
        });
    };

    const applyFilters = () => {
        const filtered = applyClientSideFilters(photos);
        setFilteredPhotos(filtered);
        setShowFilters(false);
    };

    const clearFilters = () => {
        setFilters({});
        setTimeout(() => fetchPhotos(), 0);
    };

    const handleDeletePhoto = async (photoId: number, fileName: string) => {
        if (!confirm(`Weet je zeker dat je "${fileName}" wilt verwijderen?`)) return;
        if (!backendUrl) return;

        try {
            const res = await fetch(`${backendUrl}/photos/${photoId}`, {
                method: 'DELETE'
            });

            if (res.status === 204) {
                showToast('Foto succesvol verwijderd', 'success');
                fetchPhotos();
            } else if (res.status === 404) {
                showToast('Foto niet gevonden', 'error');
            } else {
                showToast('Fout bij verwijderen', 'error');
            }
        } catch (err) {
            showToast('Netwerkfout bij verwijderen', 'error');
        }
    };

    const handleBatchDelete = async () => {
        if (selectedPhotos.length === 0) return;
        if (!confirm(`Weet je zeker dat je ${selectedPhotos.length} foto's wilt verwijderen?`)) return;
        if (!backendUrl) return;

        try {
            const res = await fetch(`${backendUrl}/photos/batch?ids=${selectedPhotos.join(',')}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const result = await res.json();
                showToast(`${result.deletedCount} van ${result.requestedCount} foto's verwijderd`, 'success');

                if (result.errors && result.errors.length > 0) {
                    result.errors.forEach((error: string) => {
                        showToast(error, 'error');
                    });
                }

                setSelectedPhotos([]);
                fetchPhotos();
            } else {
                showToast('Fout bij batch verwijderen', 'error');
            }
        } catch (err) {
            showToast('Netwerkfout bij batch verwijderen', 'error');
        }
    };

    const togglePhotoSelection = (photoId: number) => {
        setSelectedPhotos(prev =>
            prev.includes(photoId)
                ? prev.filter(id => id !== photoId)
                : [...prev, photoId]
        );
    };

    const selectAll = () => {
        setSelectedPhotos(filteredPhotos.map(p => p.id));
    };

    const deselectAll = () => {
        setSelectedPhotos([]);
    };

    const formatBytes = (bytes: number | undefined) => {
        if (!bytes || bytes === 0 || Number.isNaN(bytes)) return 'Onbekend';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('nl-NL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    const getImageTransform = (orientation?: number): React.CSSProperties => {
        if (!orientation || orientation === 1) {
            return {};
        }

        switch (orientation) {
            case 3:
                return { transform: 'rotate(180deg)' };
            case 6:
                return { transform: 'rotate(270deg)' };
            case 8:
                return { transform: 'rotate(90deg)' };
            case 2:
                return { transform: 'scaleX(-1)' };
            case 4:
                return { transform: 'scaleY(-1)' };
            case 5:
                return { transform: 'rotate(270deg) scaleX(-1)' };
            case 7:
                return { transform: 'rotate(90deg) scaleX(-1)' };
            default:
                return {};
        }
    };

    if (loading) {
        return <div style={styles.loading}>Foto's laden...</div>;
    }

    return (
        <>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h2 style={styles.title}>
                        <i className="bi bi-images"></i> Foto Galerij
                    </h2>
                    <div style={styles.actions}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={styles.filterButton}
                        >
                            <i className="bi bi-funnel"></i> Filters
                        </button>
                        {selectedPhotos.length > 0 && (
                            <button
                                onClick={handleBatchDelete}
                                style={styles.deleteButton}
                            >
                                <i className="bi bi-trash"></i> Verwijder ({selectedPhotos.length})
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div style={styles.filterPanel}>
                        <div style={styles.filterGrid}>
                            <div style={styles.filterItem}>
                                <label htmlFor="filter-make" style={styles.filterLabel}>
                                    <i className="bi bi-camera"></i> Camera Merk
                                </label>
                                <select
                                    id="filter-make"
                                    value={filters.make || ''}
                                    onChange={e => setFilters({...filters, make: e.target.value || undefined})}
                                    style={styles.filterSelect}
                                >
                                    <option value="">Alle</option>
                                    {cameraMakes.map(make => (
                                        <option key={make} value={make}>{make}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.filterItem}>
                                <label htmlFor="filter-model" style={styles.filterLabel}>
                                    <i className="bi bi-camera2"></i> Camera Model
                                </label>
                                <select
                                    id="filter-model"
                                    value={filters.model || ''}
                                    onChange={e => setFilters({...filters, model: e.target.value || undefined})}
                                    style={styles.filterSelect}
                                >
                                    <option value="">Alle</option>
                                    {cameraModels.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.filterItem}>
                                <label htmlFor="filter-lens" style={styles.filterLabel}>
                                    <i className="bi bi-circle"></i> Lens
                                </label>
                                <select
                                    id="filter-lens"
                                    value={filters.lens || ''}
                                    onChange={e => setFilters({...filters, lens: e.target.value || undefined})}
                                    style={styles.filterSelect}
                                >
                                    <option value="">Alle</option>
                                    {lensModels.map(lens => (
                                        <option key={lens} value={lens}>{lens}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.filterItem}>
                                <label htmlFor="filter-type" style={styles.filterLabel}>
                                    <i className="bi bi-file-earmark-image"></i> Type
                                </label>
                                <select
                                    id="filter-type"
                                    value={filters.isRaw === undefined ? '' : String(filters.isRaw)}
                                    onChange={e => setFilters({...filters, isRaw: e.target.value === '' ? undefined : e.target.value === 'true'})}
                                    style={styles.filterSelect}
                                >
                                    <option value="">Alle</option>
                                    <option value="true">RAW</option>
                                    <option value="false">JPEG</option>
                                </select>
                            </div>

                            <div style={styles.filterItem}>
                                <label htmlFor="filter-start-date" style={styles.filterLabel}>
                                    <i className="bi bi-calendar-range"></i> Van Datum
                                </label>
                                <input
                                    id="filter-start-date"
                                    type="datetime-local"
                                    value={filters.startDate || ''}
                                    onChange={e => setFilters({...filters, startDate: e.target.value || undefined})}
                                    style={styles.filterInput}
                                />
                            </div>

                            <div style={styles.filterItem}>
                                <label htmlFor="filter-end-date" style={styles.filterLabel}>
                                    <i className="bi bi-calendar-check"></i> Tot Datum
                                </label>
                                <input
                                    id="filter-end-date"
                                    type="datetime-local"
                                    value={filters.endDate || ''}
                                    onChange={e => setFilters({...filters, endDate: e.target.value || undefined})}
                                    style={styles.filterInput}
                                />
                            </div>
                        </div>

                        <div style={styles.filterActions}>
                            <button onClick={applyFilters} style={styles.applyButton}>
                                <i className="bi bi-check-circle"></i> Toepassen
                            </button>
                            <button onClick={clearFilters} style={styles.clearButton}>
                                <i className="bi bi-x-circle"></i> Wissen
                            </button>
                        </div>
                    </div>
                )}

                {filteredPhotos.length > 0 && (
                    <div style={styles.bulkActions}>
                        <button onClick={selectAll} style={styles.bulkButton}>
                            <i className="bi bi-check-all"></i> Selecteer Alle
                        </button>
                        <button onClick={deselectAll} style={styles.bulkButton}>
                            <i className="bi bi-x"></i> Deselecteer Alle
                        </button>
                        <span style={styles.photoCount}>
                            {filteredPhotos.length} foto's • {selectedPhotos.length} geselecteerd
                        </span>
                    </div>
                )}

                {filteredPhotos.length === 0 ? (
                    <div style={styles.noPhotos}>
                        <i className="bi bi-images" style={{fontSize: '3rem', marginBottom: '1rem'}}></i>
                        <p>Nog geen foto's gevonden</p>
                    </div>
                ) : (
                    <div style={styles.gallery}>
                        {filteredPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                style={{
                                    ...styles.photoCard,
                                    ...(selectedPhotos.includes(photo.id) ? styles.photoCardSelected : {})
                                }}
                            >
                                <button
                                    style={styles.selectOverlay}
                                    onClick={() => togglePhotoSelection(photo.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            togglePhotoSelection(photo.id);
                                        }
                                    }}
                                    aria-label="Selecteer foto"
                                    type="button"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPhotos.includes(photo.id)}
                                        onChange={() => {}}
                                        style={styles.checkbox}
                                        tabIndex={-1}
                                    />
                                </button>

                                <button
                                    style={styles.imageContainer}
                                    onClick={() => setLightboxPhoto(photo)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setLightboxPhoto(photo);
                                        }
                                    }}
                                    aria-label={`Bekijk ${photo.fileName}`}
                                    type="button"
                                    onMouseEnter={(e) => {
                                        const overlay = e.currentTarget.querySelector('.image-overlay') as HTMLElement;
                                        if (overlay) overlay.style.opacity = '1';
                                    }}
                                    onMouseLeave={(e) => {
                                        const overlay = e.currentTarget.querySelector('.image-overlay') as HTMLElement;
                                        if (overlay) overlay.style.opacity = '0';
                                    }}
                                >
                                    <img
                                        src={photo.fileUrl}
                                        alt={photo.fileName}
                                        style={{
                                            ...styles.image,
                                            ...getImageTransform(photo.orientation)
                                        }}
                                        loading="lazy"
                                        onError={(e) => {
                                            console.error('Failed to load image:', photo.fileName, photo.fileUrl);
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    {photo.isRaw && (
                                        <span style={styles.rawBadge}>RAW</span>
                                    )}
                                    <div className="image-overlay" style={styles.imageOverlay}>
                                        <i className="bi bi-arrows-fullscreen" style={{fontSize: '2rem', color: 'white'}}></i>
                                    </div>
                                </button>

                                <div style={styles.metadata}>
                                    <div style={styles.photoHeader}>
                                        <span style={styles.fileName}>{photo.fileName}</span>
                                        <button
                                            onClick={() => handleDeletePhoto(photo.id, photo.fileName)}
                                            style={styles.deleteIconButton}
                                            title="Verwijder foto"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>

                                    {(photo.cameraMake || photo.cameraModel) && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-camera"></i> Camera
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {photo.cameraModel || `${photo.cameraMake || ''}`}
                                            </span>
                                        </div>
                                    )}

                                    {photo.lensModel && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-circle"></i> Lens
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {photo.lensModel}
                                            </span>
                                        </div>
                                    )}

                                    {photo.aperture && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-camera-reels"></i> Aperture
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {photo.aperture}
                                            </span>
                                        </div>
                                    )}

                                    {photo.shutterSpeed && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-stopwatch"></i> Shutter
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {photo.shutterSpeed}
                                            </span>
                                        </div>
                                    )}

                                    {photo.iso && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-film"></i> ISO
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {photo.iso}
                                            </span>
                                        </div>
                                    )}

                                    {photo.focalLength && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-aspect-ratio"></i> Focal
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {photo.focalLength}
                                            </span>
                                        </div>
                                    )}

                                    {photo.dateTaken && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-calendar-event"></i> Genomen
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {formatDate(photo.dateTaken)}
                                            </span>
                                        </div>
                                    )}

                                    <div style={styles.metadataItem}>
                                        <span style={styles.metadataLabel}>
                                            <i className="bi bi-hdd"></i> Grootte
                                        </span>
                                        <span style={styles.metadataValue}>
                                            {formatBytes(photo.fileSize)}
                                        </span>
                                    </div>

                                    {photo.gpsLatitude && photo.gpsLongitude && (
                                        <div style={styles.metadataItem}>
                                            <span style={styles.metadataLabel}>
                                                <i className="bi bi-geo-alt-fill"></i> GPS
                                            </span>
                                            <span style={styles.metadataValue}>
                                                {photo.gpsLatitude.toFixed(6)}, {photo.gpsLongitude.toFixed(6)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}

            {lightboxPhoto && (
                <button
                    style={styles.lightboxOverlay}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setLightboxPhoto(null);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setLightboxPhoto(null);
                        }
                    }}
                    aria-label="Sluit lightbox"
                    type="button"
                >
                    <div style={styles.lightboxContent}>
                        <button
                            style={styles.lightboxClose}
                            onClick={() => setLightboxPhoto(null)}
                            title="Sluiten (ESC)"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <img
                            src={lightboxPhoto.fileUrl}
                            alt={lightboxPhoto.fileName}
                            style={{
                                ...styles.lightboxImage,
                                ...getImageTransform(lightboxPhoto.orientation)
                            }}
                        />
                        <div style={styles.lightboxInfo}>
                            <h3 style={styles.lightboxTitle}>{lightboxPhoto.fileName}</h3>
                            {lightboxPhoto.cameraModel && (
                                <p style={styles.lightboxDetail}>
                                    <i className="bi bi-camera"></i> {lightboxPhoto.cameraModel}
                                </p>
                            )}
                            {lightboxPhoto.dateTaken && (
                                <p style={styles.lightboxDetail}>
                                    <i className="bi bi-calendar-event"></i> {formatDate(lightboxPhoto.dateTaken)}
                                </p>
                            )}
                        </div>
                    </div>
                </button>
            )}
        </>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.8rem',
        color: '#e0e6ed',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        margin: 0,
    },
    actions: {
        display: 'flex',
        gap: '1rem',
    },
    filterButton: {
        backgroundColor: '#3a4f6f',
        color: '#e0e6ed',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.3s ease',
    },
    deleteButton: {
        backgroundColor: '#b33a3a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.3s ease',
    },
    filterPanel: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        border: '1px solid #3a4f6f',
    },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
    },
    filterItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    filterLabel: {
        color: '#9ab4d0',
        fontSize: '0.9rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    filterSelect: {
        backgroundColor: '#1a2332',
        color: '#e0e6ed',
        border: '1px solid #3a4f6f',
        borderRadius: '6px',
        padding: '0.5rem',
        fontSize: '0.9rem',
    },
    filterInput: {
        backgroundColor: '#1a2332',
        color: '#e0e6ed',
        border: '1px solid #3a4f6f',
        borderRadius: '6px',
        padding: '0.5rem',
        fontSize: '0.9rem',
    },
    filterActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
    },
    applyButton: {
        backgroundColor: '#5a7fa6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: '#6a6a6a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 1.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    bulkActions: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
    },
    bulkButton: {
        backgroundColor: '#3a4f6f',
        color: '#e0e6ed',
        border: 'none',
        borderRadius: '6px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    photoCount: {
        color: '#9ab4d0',
        fontSize: '0.9rem',
        marginLeft: 'auto',
    },
    gallery: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem',
    },
    photoCard: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #3a4f6f',
        transition: 'all 0.3s ease',
        position: 'relative',
    },
    photoCardSelected: {
        borderColor: '#5a7fa6',
        boxShadow: '0 0 20px rgba(90, 127, 166, 0.5)',
    },
    selectOverlay: {
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        cursor: 'pointer',
        backgroundColor: 'transparent',
        border: 'none',
        padding: 0,
    },
    checkbox: {
        width: '24px',
        height: '24px',
        cursor: 'pointer',
    },
    imageContainer: {
        width: '100%',
        height: '250px',
        overflow: 'hidden',
        backgroundColor: '#1a2332',
        position: 'relative',
        cursor: 'pointer',
        border: 'none',
        padding: 0,
        display: 'block',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
        transition: 'opacity 0.3s ease',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    rawBadge: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(90, 127, 166, 0.9)',
        color: '#ffffff',
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: '700',
    },
    metadata: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    photoHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    fileName: {
        color: '#e0e6ed',
        fontSize: '1rem',
        fontWeight: '600',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
    },
    deleteIconButton: {
        backgroundColor: 'transparent',
        color: '#b33a3a',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        padding: '0.25rem',
        transition: 'color 0.3s ease',
    },
    metadataItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem',
        backgroundColor: '#1a2332',
        borderRadius: '6px',
    },
    metadataLabel: {
        color: '#9ab4d0',
        fontSize: '0.85rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    metadataValue: {
        color: '#e0e6ed',
        fontSize: '0.85rem',
        fontWeight: '600',
        textAlign: 'right',
    },
    loading: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#9ab4d0',
    },
    noPhotos: {
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#9ab4d0',
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        margin: '2rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    lightboxOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        cursor: 'pointer',
        border: 'none',
        padding: 0,
        width: '100%',
        height: '100%',
    },
    lightboxContent: {
        position: 'relative',
        maxWidth: '90vw',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        pointerEvents: 'auto',
    },
    lightboxImage: {
        maxWidth: '100%',
        maxHeight: '80vh',
        objectFit: 'contain',
        borderRadius: '8px',
    },
    lightboxClose: {
        position: 'absolute',
        top: '-3rem',
        right: 0,
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: 'none',
        fontSize: '2rem',
        cursor: 'pointer',
        padding: '0.5rem',
        transition: 'opacity 0.3s ease',
        opacity: 0.8,
    },
    lightboxInfo: {
        color: '#ffffff',
        textAlign: 'center',
        maxWidth: '600px',
    },
    lightboxTitle: {
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
        color: '#e0e6ed',
    },
    lightboxDetail: {
        fontSize: '0.9rem',
        color: '#9ab4d0',
        margin: '0.25rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
};


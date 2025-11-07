"use client";

import React, { useState, useEffect } from 'react';

interface PhotoMetadata {
    id: number;
    filename: string;
    url: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    gpsLatitude?: string;
    gpsLongitude?: string;
}

interface PhotoGalleryProps {
    refreshTrigger?: number;
}

export default function PhotoGallery({ refreshTrigger }: PhotoGalleryProps) {
    const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
    const [backendUrl, setBackendUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/config.json')
            .then(res => res.json())
            .then(data => setBackendUrl(data.backendUrl))
            .catch(err => console.error('config.json niet gevonden', err));
    }, []);

    useEffect(() => {
        if (!backendUrl) return;

        fetchPhotos();
    }, [backendUrl, refreshTrigger]);

    const fetchPhotos = async () => {
        if (!backendUrl) return;

        try {
            const res = await fetch(`${backendUrl}/photos`);
            if (res.ok) {
                const data = await res.json();
                setPhotos(data);
            }
        } catch (err) {
            console.error('Fout bij ophalen foto\'s:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Foto's laden...</div>;
    }

    if (photos.length === 0) {
        return <div style={styles.noPhotos}>Nog geen foto's geüpload</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Geüploade Foto's</h2>
            <div style={styles.gallery}>
                {photos.map((photo) => (
                    <div key={photo.id} style={styles.photoCard}>
                        <div style={styles.imageContainer}>
                            <img
                                src={photo.url}
                                alt={photo.filename}
                                style={styles.image}
                            />
                        </div>
                        <div style={styles.metadata}>
                            <div style={styles.metadataItem}>
                                <span style={styles.metadataLabel}>
                                    <i className="bi bi-camera"></i> Aperture:
                                </span>
                                <span style={styles.metadataValue}>
                                    {photo.aperture || 'N/A'}
                                </span>
                            </div>
                            <div style={styles.metadataItem}>
                                <span style={styles.metadataLabel}>
                                    <i className="bi bi-stopwatch"></i> Shutter Speed:
                                </span>
                                <span style={styles.metadataValue}>
                                    {photo.shutterSpeed || 'N/A'}
                                </span>
                            </div>
                            <div style={styles.metadataItem}>
                                <span style={styles.metadataLabel}>
                                    <i className="bi bi-film"></i> ISO:
                                </span>
                                <span style={styles.metadataValue}>
                                    {photo.iso || 'N/A'}
                                </span>
                            </div>
                            {(photo.gpsLatitude && photo.gpsLongitude) && (
                                <div style={styles.metadataItem}>
                                    <span style={styles.metadataLabel}>
                                        <i className="bi bi-geo-alt-fill"></i> GPS:
                                    </span>
                                    <span style={styles.metadataValue}>
                                        {photo.gpsLatitude}, {photo.gpsLongitude}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '2rem',
    },
    title: {
        fontSize: '1.8rem',
        marginBottom: '2rem',
        color: '#e0e6ed',
        textAlign: 'center',
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
        border: '1px solid #3a4f6f',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    imageContainer: {
        width: '100%',
        height: '250px',
        overflow: 'hidden',
        backgroundColor: '#1a2332',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    metadata: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
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
        fontSize: '0.9rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    metadataValue: {
        color: '#e0e6ed',
        fontSize: '0.9rem',
        fontWeight: '600',
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
        margin: '2rem',
    },
};


"use client";

import React, { useState, useEffect } from 'react';
import Toast, { ToastType } from './Toast';

interface PhotoUploadProps {
    onUploadSuccess?: () => void;
}

interface ToastMessage {
    message: string;
    type: ToastType;
    id: number;
}

export default function PhotoUpload({ onUploadSuccess }: PhotoUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [backendUrl, setBackendUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        fetch('/config.json')
            .then(res => res.json())
            .then(data => setBackendUrl(data.backendUrl))
            .catch(() => {
                showToast('Configuratie kon niet worden geladen', 'error');
            });
    }, []);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleButtonClick = () => {
        document.getElementById('file-input')?.click();
    };

    const handleUpload = async () => {
        if (!file || !backendUrl) {
            showToast('Geen bestand of backend URL beschikbaar', 'warning');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${backendUrl}/photos/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                showToast(`Upload mislukt: ${errorText || 'Onbekende fout'}`, 'error');
                return;
            }

            showToast('Foto succesvol geüpload!', 'success');

            if (onUploadSuccess) {
                onUploadSuccess();
            }
            setFile(null);

            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err) {
            showToast('Upload mislukt: Netwerkfout of server onbereikbaar', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div style={styles.container}>
                <div style={styles.uploadBox}>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        style={styles.fileInput}
                    />
                    <button
                        onClick={handleButtonClick}
                        style={styles.uploadButton}
                        disabled={!backendUrl}
                    >
                        <svg
                            style={styles.cameraIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                        </svg>
                        <span style={styles.buttonText}>
                            {file ? file.name : 'Kies foto\'s'}
                        </span>
                    </button>
                    {file && (
                        <button
                            onClick={handleUpload}
                            style={styles.submitButton}
                            disabled={uploading || !backendUrl}
                        >
                            {uploading ? 'Uploaden...' : 'Upload'}
                        </button>
                    )}
                </div>
            </div>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
    },
    uploadBox: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        minWidth: '400px',
        border: '2px dashed #4a5f7f',
    },
    fileInput: {
        display: 'none',
    },
    uploadButton: {
        backgroundColor: '#3a4f6f',
        color: '#e0e6ed',
        border: 'none',
        borderRadius: '8px',
        padding: '2rem 3rem',
        fontSize: '1.1rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        transition: 'all 0.3s ease',
        width: '100%',
    },
    cameraIcon: {
        width: '64px',
        height: '64px',
        color: '#7a9cc6',
    },
    buttonText: {
        fontSize: '1rem',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#5a7fa6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        fontWeight: '600',
    },
};


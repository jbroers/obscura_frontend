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
    const [files, setFiles] = useState<File[]>([]);
    const [backendUrl, setBackendUrl] = useState<string | null>(null);
    const [maxFileSizeBytes, setMaxFileSizeBytes] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        fetch('/api/config')
            .then(res => {
                if (!res.ok) throw new Error('no-backend-config');
                return res.json();
            })
            .then(data => {
                if (data.backendUrl) setBackendUrl(data.backendUrl);
                if (data.maxFileSizeBytes) setMaxFileSizeBytes(Number(data.maxFileSizeBytes));
            })
            .catch(() => {
                fetch('/config.json')
                    .then(res => res.json())
                    .then(data => {
                        if (data.backendUrl) setBackendUrl(data.backendUrl);
                        if (data.maxFileSizeBytes) setMaxFileSizeBytes(Number(data.maxFileSizeBytes));
                        else if (data.maxFileSize) {
                            const parsed = parseSizeString(String(data.maxFileSize));
                            if (parsed) setMaxFileSizeBytes(parsed);
                        }
                    })
                    .catch(() => {
                        showToast('Configuratie kon niet worden geladen', 'error');
                    });
            });
    }, []);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    function parseSizeString(size: string): number {
        const m = size.trim().toUpperCase().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/);
        if (!m) return 0;
        const value = parseFloat(m[1]);
        const unit = m[2] || 'B';
        switch (unit) {
            case 'GB': return Math.round(value * 1024 * 1024 * 1024);
            case 'MB': return Math.round(value * 1024 * 1024);
            case 'KB': return Math.round(value * 1024);
            default: return Math.round(value);
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B','KB','MB','GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles: File[] = [];
            const allowedExtensions = [
                '.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff', '.heic',
                '.cr3', '.cr2', '.nef', '.arw', '.rw2', '.dng', '.raf', '.orf', '.raw'
            ];

            if (selectedFiles.length > 10) {
                showToast('Maximaal 10 bestanden tegelijk uploaden', 'error');
                const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
                if (fileInput) fileInput.value = '';
                return;
            }

            for (const candidate of selectedFiles) {
                const fileName = candidate.name || '';
                const fileExt = (fileName.substring(fileName.lastIndexOf('.')) || '').toLowerCase();
                const mime = candidate.type || '';

                const isImageMime = mime.startsWith('image/');
                const isAllowedExt = allowedExtensions.includes(fileExt);

                if (!isImageMime && !isAllowedExt) {
                    showToast(`Bestand ${fileName}: formaat niet ondersteund`, 'error');
                    continue;
                }

                if (maxFileSizeBytes && candidate.size > maxFileSizeBytes) {
                    showToast(`Bestand ${fileName} te groot: max ${formatBytes(maxFileSizeBytes)}`, 'error');
                    continue;
                }

                validFiles.push(candidate);
            }

            if (validFiles.length === 0) {
                const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
                if (fileInput) fileInput.value = '';
                setFiles([]);
                return;
            }

            setFiles(validFiles);
            if (validFiles.length < selectedFiles.length) {
                showToast(`${validFiles.length} van ${selectedFiles.length} bestanden geaccepteerd`, 'warning');
            }
        }
    };

    const handleButtonClick = () => {
        document.getElementById('file-input')?.click();
    };

    const handleUpload = async () => {
        if (!files.length || !backendUrl) {
            showToast('Geen bestanden of backend URL beschikbaar', 'warning');
            return;
        }

        setUploading(true);
        const formData = new FormData();

        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await fetch(`${backendUrl}/photos/upload/batch`, {
                method: 'POST',
                body: formData,
            });

            if (res.status === 413) {
                try {
                    const json = await res.json();
                    const message = json?.error ? String(json.error) : 'Upload mislukt: Bestanden te groot';
                    const max = json?.maxFileSize || (maxFileSizeBytes ? formatBytes(maxFileSizeBytes) : undefined);
                    showToast(max ? `${message} (max: ${max})` : message, 'error');
                } catch {
                    showToast('Upload mislukt: Bestanden te groot', 'error');
                }
                return;
            }

            if (!res.ok) {
                const errorText = await res.text();
                showToast(`Upload mislukt: ${errorText || 'Onbekende fout'}`, 'error');
                return;
            }

            const result = await res.json();
            const uploadedCount = result.photos?.length || files.length;
            showToast(`${uploadedCount} foto('s) succesvol geüpload!`, 'success');

            if (onUploadSuccess) {
                onUploadSuccess();
            }
            setFiles([]);

            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err: any) {
            if (err instanceof TypeError) {
                showToast('Upload mislukt: Netwerkfout of server onbereikbaar', 'error');
            } else {
                showToast('Upload mislukt: Onbekende fout tijdens upload', 'error');
            }
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
                        accept={
                            ".jpg,.jpeg,.png,.gif,.tif,.tiff,.heic,.cr3,.cr2,.nef,.arw,.rw2,.dng,.raf,.orf,.raw,image/*"
                        }
                        onChange={handleChange}
                        style={styles.fileInput}
                        multiple
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
                            {files.length > 0
                                ? `${files.length} foto${files.length > 1 ? "'s" : ''} geselecteerd`
                                : 'Kies foto\'s (max 10)'}
                        </span>
                    </button>
                    {maxFileSizeBytes && (
                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem', textAlign: 'center' }}>
                            Max bestandsgrootte: {formatBytes(maxFileSizeBytes)} per foto
                        </div>
                    )}
                    {files.length > 0 && (
                        <>
                            <div style={styles.fileList}>
                                {files.map((f, idx) => (
                                    <div key={`${f.name}-${idx}`} style={styles.fileName}>
                                        <i className="bi bi-file-earmark-image" style={{ marginRight: '0.5rem' }}></i>
                                        {f.name} ({formatBytes(f.size)})
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleUpload}
                                style={styles.submitButton}
                                disabled={uploading || !backendUrl}
                            >
                                {uploading ? 'Uploaden...' : `Upload ${files.length} foto${files.length > 1 ? "'s" : ''}`}
                            </button>
                        </>
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
    fileList: {
        width: '100%',
        maxHeight: '200px',
        overflowY: 'auto',
        backgroundColor: '#1a2332',
        borderRadius: '6px',
        padding: '1rem',
    },
    fileName: {
        color: '#e0e6ed',
        fontSize: '0.9rem',
        padding: '0.5rem',
        borderBottom: '1px solid #2a3847',
        display: 'flex',
        alignItems: 'center',
    },
};

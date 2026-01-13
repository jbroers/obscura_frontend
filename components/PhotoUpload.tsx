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

function parseSizeString(size: string): number {
    const regex = /^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/;
    const m = regex.exec(size.trim().toUpperCase());
    if (!m) return 0;
    const value = Number.parseFloat(m[1]);
    const unit = m[2] || 'B';
    switch (unit) {
        case 'GB': return Math.round(value * 1024 * 1024 * 1024);
        case 'MB': return Math.round(value * 1024 * 1024);
        case 'KB': return Math.round(value * 1024);
        default: return Math.round(value);
    }
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.cr2', '.cr3', '.nef']);

export default function PhotoUpload({ onUploadSuccess }: Readonly<PhotoUploadProps>) {
    const [files, setFiles] = useState<File[]>([]);
    const [backendUrl, setBackendUrl] = useState<string | null>(null);
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

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B','KB','MB','GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getPhotoSuffix = (count: number): string => {
        return count > 1 ? "'s" : '';
    };

    const clearFileInput = () => {
        const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
    };

    const validateFileExtension = (file: File): boolean => {
        const fileName = file.name || '';
        const fileExt = (fileName.substring(fileName.lastIndexOf('.')) || '').toLowerCase();
        return ALLOWED_EXTENSIONS.has(fileExt);
    };

    const validateFileSize = (file: File, maxSize: number): boolean => {
        return file.size <= maxSize;
    };

    const processSelectedFiles = (selectedFiles: File[]): { validFiles: File[], totalSize: number } => {
        const validFiles: File[] = [];
        let totalSize = 0;
        const MAX_FILE_SIZE = 100 * 1024 * 1024;

        for (const candidate of selectedFiles) {
            if (!validateFileExtension(candidate)) {
                showToast(`${candidate.name}: Alleen .jpg, .jpeg, .cr2, .cr3, .nef ondersteund`, 'error');
                continue;
            }

            if (!validateFileSize(candidate, MAX_FILE_SIZE)) {
                showToast(`${candidate.name} te groot: max ${formatBytes(MAX_FILE_SIZE)}`, 'error');
                continue;
            }

            totalSize += candidate.size;
            validFiles.push(candidate);
        }

        return { validFiles, totalSize };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const selectedFiles = Array.from(e.target.files);
        const MAX_TOTAL_SIZE = 1000 * 1024 * 1024;

        if (selectedFiles.length > 10) {
            showToast('Maximaal 10 bestanden tegelijk uploaden', 'error');
            clearFileInput();
            return;
        }

        const { validFiles, totalSize } = processSelectedFiles(selectedFiles);

        if (totalSize > MAX_TOTAL_SIZE) {
            showToast(`Totale grootte ${formatBytes(totalSize)} overschrijdt limiet van ${formatBytes(MAX_TOTAL_SIZE)}`, 'error');
            clearFileInput();
            return;
        }

        if (validFiles.length === 0) {
            clearFileInput();
            setFiles([]);
            return;
        }

        setFiles(validFiles);
        if (validFiles.length < selectedFiles.length) {
            showToast(`${validFiles.length} van ${selectedFiles.length} bestanden geaccepteerd`, 'warning');
        }
    };

    const handleButtonClick = () => {
        document.getElementById('file-input')?.click();
    };

    const resetFileInputAndState = () => {
        setFiles([]);
        clearFileInput();
    };

    const showDuplicateMessage = (duplicateCount: number, duplicateNames: string[]) => {
        if (duplicateNames.length <= 3) {
            showToast(
                `${duplicateCount} duplicaten overgeslagen: ${duplicateNames.join(', ')}`,
                'warning'
            );
        } else {
            showToast(
                `${duplicateCount} duplicaten overgeslagen (bijv. ${duplicateNames.slice(0, 2).join(', ')}...)`,
                'warning'
            );
        }
    };

    const handleAllDuplicates = (result: {duplicateCount: number, duplicates?: string[]}) => {
        const duplicateNames = result.duplicates || [];
        if (duplicateNames.length <= 3) {
            showToast(
                `Alle ${result.duplicateCount} foto('s) waren al geüpload: ${duplicateNames.join(', ')}`,
                'info'
            );
        } else {
            showToast(
                `Alle ${result.duplicateCount} foto('s) waren al geüpload (bijv. ${duplicateNames.slice(0, 2).join(', ')}...)`,
                'info'
            );
        }
        resetFileInputAndState();
    };

    const handleUploadErrors = async (res: Response) => {
        try {
            const result = await res.json();

            if (result.duplicateCount > 0 && result.successCount === 0 && result.failureCount === 0) {
                handleAllDuplicates(result);
                return;
            }

            showToast(`Upload mislukt: ${result.message || 'Onbekende fout'}`, 'error');
        } catch {
            const errorText = await res.text().catch(() => 'Onbekende fout');
            showToast(`Upload mislukt: ${errorText}`, 'error');
        }
    };

    const handleFailures = (failureCount: number, failures: {filename?: string, fileName?: string, error: string}[]) => {
        failures.slice(0, 3).forEach((failure) => {
            showToast(`${failure.filename || failure.fileName}: ${failure.error}`, 'error');
        });
        if (failureCount > 3) {
            showToast(`En ${failureCount - 3} andere fouten`, 'error');
        }
    };

    const processUploadResult = (result: {
        successCount: number,
        duplicateCount?: number,
        duplicates?: string[],
        failureCount?: number,
        failed?: {filename?: string, fileName?: string, error: string}[],
        totalFiles?: number
    }) => {
        if (result.successCount > 0) {
            showToast(`${result.successCount} foto('s) succesvol geüpload!`, 'success');
        }

        if (result.duplicateCount && result.duplicateCount > 0) {
            showDuplicateMessage(result.duplicateCount, result.duplicates || []);
        }

        if (result.failureCount && result.failureCount > 0) {
            handleFailures(result.failureCount, result.failed || []);
        }

        if (result.successCount === 0 && result.totalFiles && result.totalFiles > 0) {
            if (result.duplicateCount === result.totalFiles) {
                showToast('Alle foto\'s waren al geüpload', 'info');
            }
        }

        if (result.successCount > 0 && onUploadSuccess) {
            onUploadSuccess();
        }

        resetFileInputAndState();
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
                showToast('Upload mislukt: Totale grootte overschrijdt 1GB limiet', 'error');
                return;
            }

            if (!res.ok) {
                await handleUploadErrors(res);
                return;
            }

            const result = await res.json();
            processUploadResult(result);
        } catch (err) {
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
                        accept=".jpg,.jpeg,.cr2,.cr3,.nef,image/jpeg"
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
                                ? `${files.length} foto${getPhotoSuffix(files.length)} geselecteerd`
                                : 'Kies foto\'s (max 10)'}
                        </span>
                    </button>
                    <div style={{ color: '#cbd5e1', fontSize: '0.9rem', textAlign: 'center' }}>
                        Max 100MB per foto • Max 1GB totaal
                    </div>
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
                                {uploading ? 'Uploaden...' : `Upload ${files.length} foto${getPhotoSuffix(files.length)}`}
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

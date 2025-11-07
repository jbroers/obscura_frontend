"use client";

import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#4a7c59';
            case 'error':
                return '#8b4049';
            case 'warning':
                return '#9a7e3a';
            case 'info':
                return '#3a5f7f';
            default:
                return '#3a4f6f';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return 'bi-check-circle-fill';
            case 'error':
                return 'bi-x-circle-fill';
            case 'warning':
                return 'bi-exclamation-triangle-fill';
            case 'info':
                return 'bi-info-circle-fill';
            default:
                return 'bi-info-circle';
        }
    };

    return (
        <div style={{
            ...styles.toast,
            backgroundColor: getBackgroundColor(),
        }}>
            <span style={styles.icon}>
                <i className={`bi ${getIcon()}`}></i>
            </span>
            <span style={styles.message}>{message}</span>
            <button
                onClick={onClose}
                style={styles.closeButton}
                aria-label="Sluiten"
            >
                <i className="bi bi-x"></i>
            </button>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    toast: {
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        minWidth: '300px',
        maxWidth: '500px',
        color: '#ffffff',
        fontSize: '1rem',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out',
    },
    icon: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    message: {
        flex: 1,
        lineHeight: '1.4',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: '#ffffff',
        fontSize: '1.2rem',
        cursor: 'pointer',
        padding: '0 0.25rem',
        lineHeight: '1',
        opacity: 0.8,
        transition: 'opacity 0.2s',
        display: 'flex',
        alignItems: 'center',
    },
};


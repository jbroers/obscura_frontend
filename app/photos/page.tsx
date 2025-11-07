"use client";

import React, { useState } from 'react';
import PhotoUpload from "../../components/PhotoUpload";
import PhotoGallery from "../../components/PhotoGallery";

export default function PhotosPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <section style={styles.section}>
            <h1 style={styles.heading}>Upload je foto's</h1>
            <PhotoUpload onUploadSuccess={handleUploadSuccess}/>
            <div style={styles.divider}></div>
            <PhotoGallery refreshTrigger={refreshTrigger}/>
        </section>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    section: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
    },
    heading: {
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#e0e6ed',
        fontWeight: '700',
    },
    divider: {
        height: '2px',
        backgroundColor: '#3a4f6f',
        margin: '3rem auto',
        maxWidth: '80%',
        borderRadius: '2px',
    },
};

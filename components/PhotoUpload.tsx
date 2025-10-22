"use client";

import React, { useState, useEffect } from 'react';

export default function PhotoUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [backendUrl, setBackendUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch('/config.json')
            .then(res => res.json())
            .then(data => setBackendUrl(data.backendUrl))
            .catch(err => console.error('config.json niet gevonden', err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !backendUrl) return alert("Geen bestand of backend URL");

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await fetch(`${backendUrl}/photos`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Upload failed', errorText);
                alert('Upload failed');
                return;
            }

            alert('Upload success');
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        }
    };

    return (
        <div>
            <input type="file" onChange={handleChange} />
            <button onClick={handleUpload} disabled={!backendUrl}>
                Upload
            </button>
        </div>
    );
}

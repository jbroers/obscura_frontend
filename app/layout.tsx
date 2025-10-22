import './globals.css';
import Navbar from '../components/Navbar';
import React from 'react';

export const metadata = {
    title: 'Obscura',
    description: 'Photo analysis platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="nl">
        <body>
        <Navbar />
        <main style={{ padding: '2rem' }}>
            {children}
        </main>
        </body>
        </html>
    );
}

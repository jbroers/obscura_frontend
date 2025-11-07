"use client";
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav>
            <ul>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/photos">Photos</Link></li>
                <li><Link href="/statistics">Statistics</Link></li>
                <li><Link href="/about">About</Link></li>
            </ul>
        </nav>
    );
}

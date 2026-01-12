'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function App() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div style={styles.pageContainer}>
            <section style={{
                ...styles.hero,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease-out'
            }}>
                <div style={styles.heroContent}>
                    <div style={styles.badge}>Persoonlijk RAW Archief</div>
                    <h1 style={styles.heroTitle}>Obscura</h1>
                    <p style={styles.heroDescription}>
                        Upload Canon en Nikon RAW-bestanden, bekijk EXIF-data automatisch,
                        en zie al je foto's in een overzichtelijke galerij.
                    </p>
                    <div style={styles.ctaContainer}>
                        <Link href="/photos" style={styles.primaryButton}>
                            Start met uploaden
                        </Link>
                        <Link href="/statistics" style={styles.secondaryButton}>
                            Bekijk statistieken
                        </Link>
                    </div>
                </div>
            </section>

            <section style={styles.featuresSection}>
                <h2 style={styles.sectionTitle}>Wat kan Obscura?</h2>
                <div style={styles.featuresGrid}>
                    <FeatureCard
                        iconClass="bi-upload"
                        title="RAW bestanden uploaden"
                        description="Ondersteunt Canon (.CR2, .CR3) en Nikon (.NEF) formaten. Preview's worden automatisch gegenereerd uit embedded JPEG data"
                    />
                    <FeatureCard
                        iconClass="bi-info-circle"
                        title="EXIF metadata bekijken"
                        description="ISO, aperture, sluitertijd, brandpunt, lens model, white balance en opnamedatum worden automatisch uitgelezen en getoond"
                    />
                    <FeatureCard
                        iconClass="bi-grid"
                        title="Galerij overzicht"
                        description="Bekijk al je geüploade foto's in een overzichtelijke galerij met metadata per foto"
                    />
                    <FeatureCard
                        iconClass="bi-eye"
                        title="Preview's bekijken"
                        description="Bekijk embedded preview's direct in je browser. Geen wachten op RAW-rendering, gewoon snel door je archief bladeren"
                    />
                    <FeatureCard
                        iconClass="bi-bar-chart"
                        title="Statistieken analyseren"
                        description="Ontdek welke camera's en lenzen je het meest gebruikt. Krijg inzicht in je fotografiegewoonten en veel gebruikte instellingen"
                    />
                    <FeatureCard
                        iconClass="bi-cloud-upload"
                        title="Cloud opslag"
                        description="Je foto's worden opgeslagen in de cloud (MinIO). Toegankelijk vanaf elke browser, geen lokale installatie nodig"
                    />
                </div>
            </section>

            <section style={styles.howItWorksSection}>
                <h2 style={styles.sectionTitle}>Hoe werkt het?</h2>
                <div style={styles.stepsGrid}>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>1</div>
                        <h3 style={styles.stepTitle}>Upload</h3>
                        <p style={styles.stepDescription}>
                            Selecteer meerdere RAW-bestanden tegelijk (max 10). Tot 10MB per bestand wordt ondersteund
                        </p>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>2</div>
                        <h3 style={styles.stepTitle}>Automatische verwerking</h3>
                        <p style={styles.stepDescription}>
                            EXIF-metadata wordt uitgelezen en preview's worden gegenereerd. Dit gebeurt automatisch op de achtergrond
                        </p>
                    </div>
                    <div style={styles.step}>
                        <div style={styles.stepNumber}>3</div>
                        <h3 style={styles.stepTitle}>Bekijken & analyseren</h3>
                        <p style={styles.stepDescription}>
                            Bekijk je collectie in de galerij met alle metadata, en analyseer je fotografiepatronen in de statistieken pagina
                        </p>
                    </div>
                </div>
            </section>

            <section style={styles.limitationsSection}>
                <div style={styles.limitationsContainer}>
                    <h2 style={styles.limitationsTitle}>
                        <i className="bi bi-exclamation-triangle" style={styles.warningIcon}></i>
                        Belangrijk om te weten
                    </h2>
                    <div style={styles.limitationsContent}>
                        <div style={styles.limitationCard}>
                            <h3 style={styles.limitationCardTitle}>Wat het NIET is</h3>
                            <ul style={styles.limitationsList}>
                                <li style={styles.limitationItem}>❌ Geen foto-editor (cropping, color grading, retouching)</li>
                                <li style={styles.limitationItem}>❌ Geen volledig RAW-rendering (alleen embedded previews)</li>
                                <li style={styles.limitationItem}>❌ Geen sharing functies (geen publieke galerijen)</li>
                                <li style={styles.limitationItem}>❌ Geen multi-user support (single-user versie)</li>
                            </ul>
                        </div>
                        <div style={styles.limitationCard}>
                            <h3 style={styles.limitationCardTitle}>Gebruik hiervoor</h3>
                            <ul style={styles.limitationsList}>
                                <li style={styles.limitationItem}>✅ Lightroom / Capture One voor editing</li>
                                <li style={styles.limitationItem}>✅ Dropbox / WeTransfer voor delen met klanten</li>
                                <li style={styles.limitationItem}>✅ Portfolio platforms voor publieke galerijen</li>
                            </ul>
                        </div>
                    </div>
                    <p style={styles.limitationsNote}>
                        Obscura is een catalogiseer tool, geen complete foto-workflow oplossing.
                    </p>
                </div>
            </section>

            <section style={styles.specsSection}>
                <h3 style={styles.specsTitle}>Technische specificaties</h3>
                <div style={styles.specsGrid}>
                    <div style={styles.specItem}>
                        <div style={styles.specLabel}>Formaten</div>
                        <div style={styles.specValue}>CR2, CR3, NEF</div>
                    </div>
                    <div style={styles.specItem}>
                        <div style={styles.specLabel}>Max bestandsgrootte</div>
                        <div style={styles.specValue}>10MB per foto</div>
                    </div>
                    <div style={styles.specItem}>
                        <div style={styles.specLabel}>Batch upload</div>
                        <div style={styles.specValue}>10 foto's tegelijk</div>
                    </div>
                    <div style={styles.specItem}>
                        <div style={styles.specLabel}>Preview type</div>
                        <div style={styles.specValue}>Embedded JPEG</div>
                    </div>
                </div>
            </section>

            <section style={styles.finalCta}>
                <h2 style={styles.finalCtaTitle}>Klaar om te beginnen?</h2>
                <p style={styles.finalCtaText}>
                    Upload je eerste RAW-bestanden en ontdek je metadata
                </p>
                <Link href="/photos" style={styles.finalCtaButton}>
                    Naar upload pagina
                </Link>
            </section>
        </div>
    );
}

function FeatureCard({ iconClass, title, description }: { iconClass: string; title: string; description: string }) {
    return (
        <div style={styles.featureCard}>
            <i className={`bi ${iconClass}`} style={styles.featureIcon}></i>
            <h3 style={styles.featureTitle}>{title}</h3>
            <p style={styles.featureDescription}>{description}</p>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#1a2332',
    },
    hero: {
        backgroundColor: '#0f1821',
        borderBottom: '2px solid #2a3847',
        padding: '5rem 2rem 4rem 2rem',
    },
    heroContent: {
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
    },
    badge: {
        display: 'inline-block',
        padding: '0.5rem 1.25rem',
        backgroundColor: '#1a2332',
        color: '#9ab4d0',
        fontSize: '0.875rem',
        fontWeight: '600',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        border: '1px solid #2a3847',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
    },
    heroTitle: {
        fontSize: '3.5rem',
        marginBottom: '1rem',
        fontWeight: '700',
        lineHeight: '1.1',
        color: '#e0e6ed',
    },
    heroSubtitle: {
        fontSize: '1.5rem',
        color: '#9ab4d0',
        marginBottom: '1.5rem',
        fontWeight: '400',
    },
    heroDescription: {
        fontSize: '1.125rem',
        color: '#7a8fa8',
        maxWidth: '700px',
        margin: '0 auto 2.5rem auto',
        lineHeight: '1.7',
    },
    ctaContainer: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    primaryButton: {
        backgroundColor: '#3a7bc8',
        color: '#ffffff',
        padding: '0.875rem 2rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'background-color 0.3s ease',
        border: 'none',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        color: '#e0e6ed',
        padding: '0.875rem 2rem',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'background-color 0.3s ease',
        border: '2px solid #2a3847',
    },
    featuresSection: {
        padding: '5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    sectionTitle: {
        fontSize: '2.5rem',
        color: '#e0e6ed',
        textAlign: 'center',
        marginBottom: '3rem',
        fontWeight: '700',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
    },
    featureCard: {
        backgroundColor: '#0f1821',
        padding: '2rem',
        borderRadius: '6px',
        border: '1px solid #2a3847',
        transition: 'border-color 0.3s ease',
    },
    featureIcon: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
        color: '#3a7bc8',
        display: 'block',
    },
    featureTitle: {
        fontSize: '1.25rem',
        color: '#e0e6ed',
        marginBottom: '0.75rem',
        fontWeight: '600',
    },
    featureDescription: {
        fontSize: '0.9375rem',
        color: '#9ab4d0',
        lineHeight: '1.6',
    },
    howItWorksSection: {
        padding: '5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#1a2332',
    },
    stepsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
    },
    step: {
        textAlign: 'center',
        padding: '2rem',
    },
    stepNumber: {
        width: '60px',
        height: '60px',
        backgroundColor: '#3a7bc8',
        color: '#ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.75rem',
        fontWeight: '700',
        margin: '0 auto 1.5rem auto',
    },
    stepTitle: {
        fontSize: '1.25rem',
        color: '#e0e6ed',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    stepDescription: {
        fontSize: '0.9375rem',
        color: '#9ab4d0',
        lineHeight: '1.6',
    },
    limitationsSection: {
        padding: '5rem 2rem',
        backgroundColor: '#0f1821',
        borderTop: '2px solid #2a3847',
        borderBottom: '2px solid #2a3847',
    },
    limitationsContainer: {
        maxWidth: '1000px',
        margin: '0 auto',
    },
    limitationsTitle: {
        fontSize: '2rem',
        color: '#e0e6ed',
        textAlign: 'center',
        marginBottom: '2.5rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
    },
    warningIcon: {
        fontSize: '2rem',
        color: '#f0ad4e',
    },
    limitationsContent: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
    },
    limitationCard: {
        backgroundColor: '#1a2332',
        padding: '2rem',
        borderRadius: '6px',
        border: '1px solid #2a3847',
    },
    limitationCardTitle: {
        fontSize: '1.25rem',
        color: '#e0e6ed',
        marginBottom: '1.5rem',
        fontWeight: '600',
    },
    limitationsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    limitationItem: {
        fontSize: '0.9375rem',
        color: '#9ab4d0',
        lineHeight: '1.8',
        marginBottom: '0.75rem',
    },
    limitationsNote: {
        fontSize: '1rem',
        color: '#7a8fa8',
        lineHeight: '1.6',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: '2rem',
    },
    specsSection: {
        padding: '4rem 2rem',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    specsTitle: {
        fontSize: '1.5rem',
        color: '#e0e6ed',
        textAlign: 'center',
        marginBottom: '2rem',
        fontWeight: '600',
    },
    specsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
    },
    specItem: {
        textAlign: 'center',
        padding: '1.5rem',
        backgroundColor: '#0f1821',
        borderRadius: '6px',
        border: '1px solid #2a3847',
    },
    specLabel: {
        fontSize: '0.875rem',
        color: '#7a8fa8',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: '600',
    },
    specValue: {
        fontSize: '1.125rem',
        color: '#e0e6ed',
        fontWeight: '600',
    },
    finalCta: {
        padding: '5rem 2rem',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
    },
    finalCtaTitle: {
        fontSize: '2.5rem',
        color: '#e0e6ed',
        marginBottom: '1rem',
        fontWeight: '700',
    },
    finalCtaText: {
        fontSize: '1.125rem',
        color: '#9ab4d0',
        marginBottom: '2rem',
        lineHeight: '1.6',
    },
    finalCtaButton: {
        backgroundColor: '#3a7bc8',
        color: '#ffffff',
        padding: '1rem 2.5rem',
        borderRadius: '4px',
        fontSize: '1.125rem',
        fontWeight: '600',
        textDecoration: 'none',
        display: 'inline-block',
        transition: 'background-color 0.3s ease',
    },
};




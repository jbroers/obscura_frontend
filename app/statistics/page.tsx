"use client";

import React, { useState, useEffect } from 'react';
import Toast, { ToastType } from '../../components/Toast';

interface ToastMessage {
    message: string;
    type: ToastType;
    id: number;
}

interface PhotoStatistics {
    totalPhotos: number;
    totalRawPhotos: number;
    totalJpegPhotos: number;
    totalStorageUsedMB: number;

    mostUsedCamera?: string;
    cameraUsage: Record<string, number>;

    mostUsedLens?: string;
    lensUsage: Record<string, number>;

    mostUsedAperture?: string;
    apertureDistribution: Record<string, number>;

    mostUsedIso?: string;
    isoDistribution: Record<string, number>;

    mostUsedFocalLength?: string;
    focalLengthDistribution: Record<string, number>;

    photosWithGps: number;
    photosWithoutGps: number;
    averageLatitude?: number;
    averageLongitude?: number;

    uploadPeriod: string;
    photosLastWeek: number;
    photosLastMonth: number;
    mostActiveDay?: string;

    insights: string[];
    recommendations: string[];
}

export default function StatisticsPage() {
    const [stats, setStats] = useState<PhotoStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [backendUrl, setBackendUrl] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        fetch('/config.json')
            .then(res => res.json())
            .then(data => setBackendUrl(data.backendUrl))
            .catch(() => {
                showToast('Configuratie kon niet worden geladen', 'error');
            });
    }, []);

    useEffect(() => {
        if (!backendUrl) return;
        fetchStatistics();
    }, [backendUrl]);

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { message, type, id }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchStatistics = async () => {
        if (!backendUrl) return;

        try {
            const res = await fetch(`${backendUrl}/statistics`);
            if (!res.ok) {
                throw new Error('Failed to fetch statistics');
            }
            const data = await res.json();
            setStats(data);
        } catch (err) {
            showToast('Kon statistieken niet ophalen', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>Statistieken laden...</div>;
    }

    if (!stats) {
        return <div style={styles.noData}>Geen statistieken beschikbaar</div>;
    }

    return (
        <>
            <div style={styles.container}>
                <h1 style={styles.title}>
                    <i className="bi bi-bar-chart-fill" style={styles.titleIcon}></i>{' '}
                    Foto Statistieken
                </h1>

                {}
                <div style={styles.cardGrid}>
                    <StatCard
                        icon="bi-camera-fill"
                        title="Totaal Foto's"
                        value={stats.totalPhotos}
                        subtitle={`${stats.totalRawPhotos} RAW • ${stats.totalJpegPhotos} JPEG`}
                    />
                    <StatCard
                        icon="bi-hdd-fill"
                        title="Opslag Gebruikt"
                        value={`${stats.totalStorageUsedMB} MB`}
                        subtitle={`${(stats.totalStorageUsedMB / 1024).toFixed(2)} GB`}
                    />
                    <StatCard
                        icon="bi-calendar-week"
                        title="Deze Week"
                        value={stats.photosLastWeek}
                        subtitle={`${stats.photosLastMonth} deze maand`}
                    />
                    <StatCard
                        icon="bi-geo-alt-fill"
                        title="Met GPS"
                        value={stats.photosWithGps}
                        subtitle={`${Math.round((stats.photosWithGps / stats.totalPhotos) * 100)}%`}
                    />
                </div>

                {}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <i className="bi bi-camera-video"></i> Apparatuur
                    </h2>
                    <div style={styles.equipmentGrid}>
                        <div style={styles.equipmentCard}>
                            <h3 style={styles.equipmentCardTitle}>Camera's</h3>
                            {stats.mostUsedCamera && (
                                <div style={styles.mostUsed}>
                                    <span style={styles.mostUsedLabel}>Meest gebruikt:</span>
                                    <span style={styles.mostUsedValue}>{stats.mostUsedCamera}</span>
                                </div>
                            )}
                            <div style={styles.distributionList}>
                                {Object.entries(stats.cameraUsage)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([camera, count]) => (
                                        <DistributionBar
                                            key={camera}
                                            label={camera}
                                            value={count}
                                            total={stats.totalPhotos}
                                        />
                                    ))}
                            </div>
                        </div>

                        <div style={styles.equipmentCard}>
                            <h3 style={styles.equipmentCardTitle}>Lenzen</h3>
                            {stats.mostUsedLens && (
                                <div style={styles.mostUsed}>
                                    <span style={styles.mostUsedLabel}>Meest gebruikt:</span>
                                    <span style={styles.mostUsedValue}>{stats.mostUsedLens}</span>
                                </div>
                            )}
                            <div style={styles.distributionList}>
                                {Object.entries(stats.lensUsage)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([lens, count]) => (
                                        <DistributionBar
                                            key={lens}
                                            label={lens}
                                            value={count}
                                            total={stats.totalPhotos}
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>

                {}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <i className="bi bi-gear-fill"></i> Camera Instellingen
                    </h2>
                    <div style={styles.exifGrid}>
                        <ExifDistribution
                            icon="bi-brightness-high-fill"
                            title="Diafragma"
                            mostUsed={stats.mostUsedAperture}
                            distribution={stats.apertureDistribution}
                            total={stats.totalPhotos}
                        />
                        <ExifDistribution
                            icon="bi-film"
                            title="ISO"
                            mostUsed={stats.mostUsedIso}
                            distribution={stats.isoDistribution}
                            total={stats.totalPhotos}
                        />
                        <ExifDistribution
                            icon="bi-search"
                            title="Brandpuntsafstand"
                            mostUsed={stats.mostUsedFocalLength}
                            distribution={stats.focalLengthDistribution}
                            total={stats.totalPhotos}
                        />
                    </div>
                </div>

                {}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <i className="bi bi-calendar3"></i> Activiteit
                    </h2>
                    <div style={styles.activityGrid}>
                        <div style={styles.activityCard}>
                            <div style={styles.activityIcon}>
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div style={styles.activityLabel}>Upload Periode</div>
                            <div style={styles.activityValue}>{stats.uploadPeriod}</div>
                        </div>
                        {stats.mostActiveDay && (
                            <div style={styles.activityCard}>
                                <div style={styles.activityIcon}>
                                    <i className="bi bi-calendar-check"></i>
                                </div>
                                <div style={styles.activityLabel}>Meest Actieve Dag</div>
                                <div style={styles.activityValue}>{stats.mostActiveDay}</div>
                            </div>
                        )}
                        <div style={styles.activityCard}>
                            <div style={styles.activityIcon}>
                                <i className="bi bi-pin-map-fill"></i>
                            </div>
                            <div style={styles.activityLabel}>GPS Locaties</div>
                            <div style={styles.activityValue}>
                                {stats.photosWithGps} van {stats.totalPhotos}
                            </div>
                        </div>
                    </div>
                </div>

                {}
                {stats.insights.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <i className="bi bi-lightbulb-fill"></i> Inzichten
                        </h2>
                        <div style={styles.insightsList}>
                            {stats.insights.map((insight, i) => (
                                <div key={i} style={styles.insightCard}>
                                    <div style={styles.insightIcon}>
                                        <i className="bi bi-stars"></i>
                                    </div>
                                    <div style={styles.insightText}>{insight}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {}
                {stats.recommendations.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <i className="bi bi-bullseye"></i> Aanbevelingen
                        </h2>
                        <div style={styles.recommendationsList}>
                            {stats.recommendations.map((rec, i) => (
                                <div key={i} style={styles.recommendationCard}>
                                    <div style={styles.recommendationIcon}>
                                        <i className="bi bi-lamp-fill"></i>
                                    </div>
                                    <div style={styles.recommendationText}>{rec}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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

function StatCard({ icon, title, value, subtitle }: {
    icon: string;
    title: string;
    value: string | number;
    subtitle?: string;
}) {
    return (
        <div style={styles.statCard}>
            <div style={styles.statIcon}>
                <i className={`bi ${icon}`}></i>
            </div>
            <div style={styles.statContent}>
                <div style={styles.statTitle}>{title}</div>
                <div style={styles.statValue}>{value}</div>
                {subtitle && <div style={styles.statSubtitle}>{subtitle}</div>}
            </div>
        </div>
    );
}

function DistributionBar({ label, value, total }: {
    label: string;
    value: number;
    total: number;
}) {
    const percentage = (value / total) * 100;

    return (
        <div style={styles.distributionItem}>
            <div style={styles.distributionLabel}>
                <span>{label}</span>
                <span style={styles.distributionCount}>{value}</span>
            </div>
            <div style={styles.distributionBarContainer}>
                <div
                    style={{
                        ...styles.distributionBarFill,
                        width: `${percentage}%`,
                    }}
                />
            </div>
            <div style={styles.distributionPercentage}>{percentage.toFixed(0)}%</div>
        </div>
    );
}

function ExifDistribution({ icon, title, mostUsed, distribution, total }: {
    icon: string;
    title: string;
    mostUsed?: string;
    distribution: Record<string, number>;
    total: number;
}) {
    return (
        <div style={styles.exifCard}>
            <div style={styles.exifHeader}>
                <span style={styles.exifIcon}>
                    <i className={`bi ${icon}`}></i>
                </span>
                <h3 style={styles.exifTitle}>{title}</h3>
            </div>
            {mostUsed && (
                <div style={styles.exifMostUsed}>
                    Favoriet: <strong>{mostUsed}</strong>
                </div>
            )}
            <div style={styles.exifDistribution}>
                {Object.entries(distribution)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([key, value]) => (
                        <DistributionBar
                            key={key}
                            label={key}
                            value={value}
                            total={total}
                        />
                    ))}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '1.2rem',
        color: '#7a9cc6',
    },
    noData: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '1.2rem',
        color: '#7a9cc6',
    },
    title: {
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#e0e6ed',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
    },
    titleIcon: {
        fontSize: '2rem',
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
    },
    statCard: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        border: '1px solid #3a4f6f',
    },
    statIcon: {
        fontSize: '2.5rem',
        color: '#7a9cc6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statContent: {
        flex: 1,
    },
    statTitle: {
        fontSize: '0.9rem',
        color: '#9ab0c9',
        marginBottom: '0.5rem',
    },
    statValue: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#e0e6ed',
    },
    statSubtitle: {
        fontSize: '0.85rem',
        color: '#7a9cc6',
        marginTop: '0.25rem',
    },
    section: {
        marginBottom: '3rem',
    },
    sectionTitle: {
        fontSize: '1.8rem',
        color: '#e0e6ed',
        marginBottom: '1.5rem',
        fontWeight: '600',
    },
    equipmentGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
    },
    equipmentCard: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #3a4f6f',
    },
    equipmentCardTitle: {
        fontSize: '1.2rem',
        color: '#e0e6ed',
        marginBottom: '1rem',
        fontWeight: '600',
    },
    mostUsed: {
        backgroundColor: '#3a4f6f',
        borderRadius: '8px',
        padding: '0.75rem',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    mostUsedLabel: {
        fontSize: '0.85rem',
        color: '#9ab0c9',
    },
    mostUsedValue: {
        fontSize: '1.1rem',
        color: '#e0e6ed',
        fontWeight: '600',
    },
    distributionList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    distributionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    distributionLabel: {
        flex: '0 0 200px',
        fontSize: '0.9rem',
        color: '#e0e6ed',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    distributionCount: {
        fontSize: '0.85rem',
        color: '#7a9cc6',
    },
    distributionBarContainer: {
        flex: 1,
        height: '8px',
        backgroundColor: '#1a2332',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    distributionBarFill: {
        height: '100%',
        backgroundColor: '#5a7fa6',
        borderRadius: '4px',
        transition: 'width 0.5s ease',
    },
    distributionPercentage: {
        flex: '0 0 45px',
        textAlign: 'right',
        fontSize: '0.85rem',
        color: '#7a9cc6',
    },
    exifGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
    },
    exifCard: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #3a4f6f',
    },
    exifHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    exifIcon: {
        fontSize: '1.5rem',
    },
    exifTitle: {
        fontSize: '1.2rem',
        color: '#e0e6ed',
        fontWeight: '600',
    },
    exifMostUsed: {
        fontSize: '0.9rem',
        color: '#9ab0c9',
        marginBottom: '1rem',
        padding: '0.5rem',
        backgroundColor: '#1a2332',
        borderRadius: '6px',
    },
    exifDistribution: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
    },
    activityGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
    },
    activityCard: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        border: '1px solid #3a4f6f',
    },
    activityIcon: {
        fontSize: '2.5rem',
        marginBottom: '0.75rem',
        color: '#7a9cc6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityLabel: {
        fontSize: '0.9rem',
        color: '#9ab0c9',
        marginBottom: '0.5rem',
    },
    activityValue: {
        fontSize: '1.3rem',
        color: '#e0e6ed',
        fontWeight: '600',
    },
    insightsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    insightCard: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        border: '1px solid #4a7c59',
        borderLeft: '4px solid #4a7c59',
    },
    insightIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
        color: '#6ab386',
        display: 'flex',
        alignItems: 'center',
    },
    insightText: {
        flex: 1,
        fontSize: '1rem',
        color: '#e0e6ed',
        lineHeight: '1.6',
    },
    recommendationsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    recommendationCard: {
        backgroundColor: '#2a3847',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        border: '1px solid #7a6f3a',
        borderLeft: '4px solid #9a7e3a',
    },
    recommendationIcon: {
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    recommendationText: {
        flex: 1,
        fontSize: '1rem',
        color: '#e0e6ed',
        lineHeight: '1.6',
    },
};


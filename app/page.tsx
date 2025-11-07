export default function App() {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Welkom bij Obscura</h1>
            <p style={styles.subtitle}>Jouw foto-analyse platform</p>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 2rem',
        textAlign: 'center',
    },
    heading: {
        fontSize: '3rem',
        color: '#e0e6ed',
        marginBottom: '1rem',
        fontWeight: '700',
    },
    subtitle: {
        fontSize: '1.5rem',
        color: '#9ab4d0',
    },
};


export const themes = {
    dark: {
        name: 'Dark',
        colors: {
            '--bg-primary': '#0a0a0f',
            '--bg-secondary': '#141420',
            '--bg-tertiary': '#1e1e2e',
            '--text-primary': '#ffffff',
            '--text-secondary': '#a0a0b0',
            '--text-muted': '#6b6b7a',
            '--border-color': '#2a2a3a',
            '--accent-primary': '#6366f1',
            '--accent-secondary': '#8b5cf6',
            '--accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        }
    },
    light: {
        name: 'Light',
        colors: {
            '--bg-primary': '#ffffff',
            '--bg-secondary': '#f4f4f5',
            '--bg-tertiary': '#e4e4e7',
            '--text-primary': '#09090b',
            '--text-secondary': '#52525b',
            '--text-muted': '#71717a',
            '--border-color': '#e4e4e7',
            '--accent-primary': '#6366f1',
            '--accent-secondary': '#8b5cf6',
            '--accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        }
    },
    ocean: {
        name: 'Ocean',
        colors: {
            '--bg-primary': '#0f172a', // Slate 900
            '--bg-secondary': '#1e293b', // Slate 800
            '--bg-tertiary': '#334155', // Slate 700
            '--text-primary': '#f8fafc',
            '--text-secondary': '#94a3b8',
            '--text-muted': '#64748b',
            '--border-color': '#334155',
            '--accent-primary': '#0ea5e9', // Sky 500
            '--accent-secondary': '#38bdf8', // Sky 400
            '--accent-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)'
        }
    },
    sunset: {
        name: 'Sunset',
        colors: {
            '--bg-primary': '#450a0a', // Red 950
            '--bg-secondary': '#7f1d1d', // Red 900
            '--bg-tertiary': '#991b1b', // Red 800
            '--text-primary': '#fff1f2',
            '--text-secondary': '#fecaca',
            '--text-muted': '#fca5a5',
            '--border-color': '#991b1b',
            '--accent-primary': '#f97316', // Orange 500
            '--accent-secondary': '#fdba74', // Orange 300
            '--accent-gradient': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)'
        }
    },
    nature: {
        name: 'Nature',
        colors: {
            '--bg-primary': '#052e16', // Green 950
            '--bg-secondary': '#064e3b', // Green 900
            '--bg-tertiary': '#065f46', // Emerald 800
            '--text-primary': '#ecfdf5',
            '--text-secondary': '#a7f3d0',
            '--text-muted': '#6ee7b7',
            '--border-color': '#065f46',
            '--accent-primary': '#10b981', // Emerald 500
            '--accent-secondary': '#34d399', // Emerald 400
            '--accent-gradient': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        }
    },
    lavender: {
        name: 'Lavender',
        colors: {
            '--bg-primary': '#2e1065', // Violet 950
            '--bg-secondary': '#4c1d95', // Violet 900
            '--bg-tertiary': '#5b21b6', // Violet 800
            '--text-primary': '#f5f3ff',
            '--text-secondary': '#ddd6fe',
            '--text-muted': '#a78bfa',
            '--border-color': '#5b21b6',
            '--accent-primary': '#a78bfa', // Violet 400
            '--accent-secondary': '#c4b5fd', // Violet 300
            '--accent-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #d8b4fe 100%)'
        }
    },
    rose: {
        name: 'Rose',
        colors: {
            '--bg-primary': '#4c0519', // Rose 950
            '--bg-secondary': '#881337', // Rose 900
            '--bg-tertiary': '#9f1239', // Rose 800
            '--text-primary': '#fff1f2',
            '--text-secondary': '#fecdd3',
            '--text-muted': '#fda4af',
            '--border-color': '#9f1239',
            '--accent-primary': '#fb7185', // Rose 400
            '--accent-secondary': '#f43f5e', // Rose 500
            '--accent-gradient': 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)'
        }
    },
    coffee: {
        name: 'Coffee',
        colors: {
            '--bg-primary': '#271c19', // Stone/Custom Brown
            '--bg-secondary': '#44302b',
            '--bg-tertiary': '#5e433e',
            '--text-primary': '#f5f5f4', // Stone 100
            '--text-secondary': '#d6d3d1', // Stone 300
            '--text-muted': '#a8a29e', // Stone 400
            '--border-color': '#5e433e',
            '--accent-primary': '#d97706', // Amber 600
            '--accent-secondary': '#f59e0b', // Amber 500
            '--accent-gradient': 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)'
        }
    }
};

export const applyTheme = (themeName) => {
    const theme = themes[themeName] || themes.dark;
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
};

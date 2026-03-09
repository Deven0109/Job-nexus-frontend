import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4F46E5', // primary-600
            light: '#818CF8', // primary-400
            dark: '#3730A3',  // primary-800
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#14B8A6', // secondary-500
            light: '#5EEAD4', // secondary-300
            dark: '#0F766E',  // secondary-700
        },
        error: {
            main: '#EF4444', // danger-500
        },
        warning: {
            main: '#F59E0B', // warning-500
        },
        info: {
            main: '#3B82F6', // info-500
        },
        success: {
            main: '#22C55E', // success-500
        },
        background: {
            default: '#F8FAFC', // dark-50
            paper: '#ffffff',
        },
        text: {
            primary: '#1E293B', // dark-800
            secondary: '#64748B', // dark-500
        },
    },
    typography: {
        fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
        h1: { fontWeight: 900 },
        h2: { fontWeight: 900 },
        h3: { fontWeight: 900 },
        h4: { fontWeight: 900 },
        h5: { fontWeight: 800 },
        h6: { fontWeight: 700 },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        button: {
            fontWeight: 700,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 20px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                },
            },
        },
    },
});

export default theme;

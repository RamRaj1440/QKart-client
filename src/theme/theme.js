import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#00a278", // QKart green
            light: "#33b593", // Lighter shade of QKart green
            dark: "#007055", // Darker shade of QKart green
            contrastText: "#ffffff", // White text on primary color
        },
        secondary: {
            main: "#f5f5f5",
        },
        background: {
            default: "#f9f9f9", // White background
        },
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        button: {
            textTransform: "none", // No ALL CAPS buttons
            fontWeight: 700, // Semi-bold buttons
        },
    },
    shape: {
        borderRadius: 8, // Rounded corners for buttons and cards
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Rounded corners for buttons
                    boxShadow: "none", // No shadow for buttons
                    "&:hover": {
                        boxShadow: "none", // No shadow on hover
                    },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: "medium", // Medium size for text fields
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12, // Rounded corners for cards
                    },
                },
            },
        },
    },

});

export default theme;
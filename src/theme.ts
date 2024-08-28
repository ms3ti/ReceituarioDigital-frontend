import { extendTheme } from "@chakra-ui/theme-utils";

const activeLabelStyles = {
    transform: "scale(0.85) translateY(-14px)",
    backgroundColor: "transparent",
    fontSize: "14px",
    paddingLeft: "10px",
    paddingBottom: "15px",
};

export const theme = extendTheme({
    colors: {
        red: {
            100: "#D72A34",
        },
        darkBlue: {
            100: "#2596be",
        },
        gray: {
            100: "#94A0B4",
            200: "#7D899D",
            300: "#4C535E",
            400: "#3E4C62",
            500: "#EDEDF3",
            600: "#202D46",
        },
        black: {
            0: "#000000",
            100: "#1C1C1C",
            200: "#202D46",
            300: "#16222F",
        },
        white: {
            10: "#FFFFFF",
            100: "#F7F8FA",
            200: "#F7F7F7",
        },
        green: {
            100: "#1CC162",
        },
        blue: {
            100: "#1C6DD5",
            200: "#202D46",
        },
    },
    breakpoints: {
        xs: "0.75rem",
        sm: "30em",
        md: "48em",
        lg: "62em",
        xl: "80em",
        "2xl": "96em",
    },
    fontSizes: {
        xs: "0.75rem",
        sm: "0.875rem",
        md: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "3.75rem",
        "7xl": "4.5rem",
        "8xl": "6rem",
        "9xl": "8rem",
    },
    fontWeights: {
        hairline: 100,
        thin: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    },
    fonts: {
        heading: `'Avenir', sans-serif`,
        body: `'Avenir', sans-serif`,
    },
    lineHeights: {
        normal: "normal",
        none: 1,
        shorter: 1.25,
        short: 1.375,
        base: 1.5,
        tall: 1.625,
        taller: "2",
        "3": ".75rem",
        "4": "1rem",
        "5": "1.25rem",
        "6": "1.5rem",
        "7": "1.75rem",
        "8": "2rem",
        "9": "2.25rem",
        "10": "2.5rem",
    },
    letterSpacings: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
    },
    components: {
        Form: {
            variants: {
                floating: {
                    container: {
                        _focusWithin: {
                            label: {
                                ...activeLabelStyles,
                            },
                        },
                        "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label":
                            {
                                ...activeLabelStyles,
                            },
                        label: {
                            top: 0,
                            left: 0,
                            zIndex: 2,
                            position: "absolute",
                            backgroundColor: "white",
                            pointerEvents: "none",
                            mx: 3,
                            px: 1,
                            my: 2,
                            transformOrigin: "left top",
                            marginTop: "19px",
                        },
                    },
                },
            },
        },
    },
});

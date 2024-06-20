// theme.ts
import { createTheme } from "@mui/material/styles";
import { Palette, PaletteOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
    interface Palette {
        peach: {
            light: string;
            main: string;
            dark: string;
            lightContrastText: string;
            darkContrastText: string;
            extraLight?: string;
            extraDark?: string;
        };
        gold: Palette["primary"];
    }

    interface PaletteOptions {
        peach?: {
            light: string;
            main: string;
            dark: string;
            lightContrastText: string;
            darkContrastText: string;
            extraLight?: string;
            extraDark?: string;
        };
        gold: PaletteOptions["primary"];
    }
}

const theme = createTheme({
    palette: {
        peach: {
            light: "#f3d9c8",
            main: "#f6b99d",
            dark: "#f1a180",
            lightContrastText: "#ffffff",
            darkContrastText: "000000",
            extraLight: "#fbeee5",
            extraDark: "#EC7F52",
        },
        gold: {
            main: "#e8b154",
            light: "#fcca73",
            contrastText: "#000000",
        },
    },
});

export default theme;

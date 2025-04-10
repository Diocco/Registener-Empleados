import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "./App";
import { blue } from "@mui/material/colors";

const container = document.getElementById("root");
const root = createRoot(container!); 

const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        light: "#3451ce",
        main: "#0526B9",
        dark: "#1c2f81",
      },
    },
    
  });

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>
    );

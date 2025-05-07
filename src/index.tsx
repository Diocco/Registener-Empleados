import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import App from "./App";
import { blue } from "@mui/material/colors";
import { Provider } from "react-redux";
import store from "./redux/store";

const container = document.getElementById("root");
const root = createRoot(container!); 

const theme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        light: "#3451ce",
        main: "#0526B9",
        dark: "#1c2f81",
        contrastText: "#c0c0c0",
      },
    },
    
  });

root.render(
    <React.StrictMode>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
              <App />
          </ThemeProvider>
        </Provider>
    </React.StrictMode>
    );

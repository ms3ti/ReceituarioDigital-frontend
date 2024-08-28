import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./theme";
import { Fonts } from "./fonts";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
);

root.render(
    <React.StrictMode>
        <ToastContainer position="bottom-center" />
        <ChakraProvider theme={theme}>
            <Fonts />
            <App />
        </ChakraProvider>
    </React.StrictMode>,
);

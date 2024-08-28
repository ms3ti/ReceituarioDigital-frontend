import React from "react";
import { Router } from "./routes";
import { AccountProvider } from "./contexts/accountContext";

function App() {
    return (
        <React.Fragment>
            <AccountProvider>
                <Router />
            </AccountProvider>
        </React.Fragment>
    );
}

export default App;

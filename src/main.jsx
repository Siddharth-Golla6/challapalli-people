import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import MockBanner from "./components/MockBanner.jsx";
import "./index.css";

// Opt into the two React Router v7 behaviours now so the dev console stays
// quiet and the eventual v7 upgrade is a no-op. These flags are advisory:
// react-router v6.x enables the new behaviour on request without breaking the
// current API.
const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={routerFutureFlags}>
      <App />
      <MockBanner />
    </BrowserRouter>
  </React.StrictMode>
);

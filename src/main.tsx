import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles.css";

import { diagnoseDatabase } from "./db/database";
if (import.meta.env.DEV) {
  void diagnoseDatabase();
}

// --------------------------------------------------
// BENCHFLOW — APPLICATION ENTRY POINT
// --------------------------------------------------

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from "react";
import { createRoot } from "react-dom/client";
// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// If you need Bootstrap JavaScript
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import App from "./components/App";

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);

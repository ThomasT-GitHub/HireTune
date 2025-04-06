// filepath: /Users/thomas/Repos/HireTune/HireTuneSite/frontend/src/components/Tuner.js
import React from "react";
import { createRoot } from "react-dom/client";

function Tuner() {
  return (
    <div
      style={{
        backgroundColor: "#030712",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <h1>Tuner Page</h1>
    </div>
  );
}

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<Tuner />);
}

export default Tuner;

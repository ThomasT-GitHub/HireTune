import React from "react";

const containerStyle = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center"
};

function App() {
  return (
    <>
      <div className="container-fluid p-3 text-light" style={containerStyle}>
        <div className="mx-auto text-center" style={{ maxWidth: "1000px" }}>
          <h1 style={{ fontSize: "5em" }}>
            Hire<span style={{ color: "#3DFF74" }}>Tune</span>
          </h1>
          <p style={{ fontStyle: "italic", fontSize: "1.5em" }}>
            Hiring season made easy.
          </p>
          <div className="mt-4">
            <a href="/tuner/" className="btn btn-primary btn-lg">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
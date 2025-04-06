import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

// Import Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// If you need Bootstrap JavaScript
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const containerStyle = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  minHeight: "100vh"
};

const formDivStyle = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  borderWidth: 3,
  borderStyle: "solid",
  color: "#ffffff",
  height: 400,
  resize: "none",
  fontSize: "1.5em"
};

const pdfFormView = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  borderWidth: 3,
  borderStyle: "solid",
  maxWidth: "1000px",
  fontWeight: "bold",
  width: "100%",
  margin: "0 auto"
};

const button1 = {
  backgroundColor: "#CACACA",
  width: "25%",
  fontWeight: "bold",
  color: "#000000",
  "--btn-glow-color": "rgba(202, 202, 202, 0.6)"
};

const button2 = {
  backgroundColor: "#3D6DFF",
  fontWeight: "bold",
  width: "25%",
  color: "#000000",
  "--btn-glow-color": "rgba(61, 109, 255, 0.6)"
};

const button3 = {
  backgroundColor: "#3DFF74",
  width: "50%",
  fontWeight: "bold",
  color: "#000000",
  "--btn-glow-color": "rgba(61, 255, 116, 0.6)"
};

function Tuner() {
  // Updates the state of the user
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch('http://0.0.0.0:8000/api/current_user/', {
      credentials: 'include', // ensures cookies are sent for session auth
    })
    .then(response => response.json())
    .then(data => setUserData(data))
    .catch(error => console.error('Error fetching current user:', error));
  }, []);
  
  return (
    <>
      {/* Style tag for placeholder and button glow styling */}
      <style>
        {`
          .placeholder-light::placeholder {
            color: #9CA3AF !important;
            opacity: 1;
          }

          /* Glow effect for buttons using custom properties */
          .btn-glow {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: box-shadow 0.3s ease-in-out;
          }

          .btn-glow:hover {
            box-shadow: 0 4px 12px var(--btn-glow-color);
          }
        `}
      </style>
      <div className="container-fluid p-3 text-light" style={containerStyle}>
        {/* Main container with maxWidth 1000px */}
        <div className="mx-auto" style={{ maxWidth: "1000px" }}>
          {/* Header Row */}
          <div className="row mb-3">
            <div className="col">
              <h1>
                <a href="/" style={{ textDecoration: "none", color: "#ffffff" }}>Hire<span style={{ color: "#3DFF74" }}>Tune</span></a>
              </h1>
            </div>
            <div className="col text-end">
              <a href='/tuner/auth/login/discord/?next=/tuner/'>
                <button className="btn btn-outline-light me-2">Sign In</button>
              </a> 
            </div>
          </div>

          {/* Forms Row */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="mb-3">
                <textarea
                  className="form-control placeholder-light"
                  id="resumeInput"
                  rows="10"
                  style={formDivStyle}
                  placeholder="Enter resume here"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <textarea
                  className="form-control placeholder-light"
                  id="jobInput"
                  rows="10"
                  style={formDivStyle}
                  placeholder="Enter job description here"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="row mt-3">
            <div className="col">
              <div className="d-flex justify-content-center" style={{ gap: "10px" }}>
                <button className="btn btn-secondary btn-glow" style={button1}>Save</button>
                <button className="btn btn-primary btn-glow" style={button2}>Download</button>
                <button className="btn btn-success btn-glow" style={button3}>Tune my resume</button>
              </div>
            </div>
          </div>

          {/* PDF Preview Row */}
          <div className="row mt-4 justify-content-center">
            <div className="col-12">
              <div className="form-control" style={pdfFormView}>
                <div style={{ width: "100%", height: "400px" }}>
                  {/* PDF content goes here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("app");
    if (container) {
      const root = createRoot(container);
      root.render(<Tuner />);
    }
  });

export default Tuner;
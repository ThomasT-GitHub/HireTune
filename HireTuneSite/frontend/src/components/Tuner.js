import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
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
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to handle tuning the resume
  const handleTuneResume = async () => {
    if (!resumeText || !jobDescription) {
      setError("Please enter both resume and job description.");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setPdfUrl(null);
    
    try {
      const response = await fetch("/api/tune-resume/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jobDescription
        })
      });
  
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
  
      const data = await response.json();
      setResult(data);
      console.log("Tuned resume data:", data);
      
      // If tuned_resume (LaTeX code) exists, generate PDF.
      if (data.tuned_resume) {
        await handleGeneratePDF(data.tuned_resume);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Error tuning resume:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to generate PDF from tuned LaTeX code.
  const handleGeneratePDF = async (latexCode) => {
    try {
      const pdfResponse = await fetch("/api/generate-pdf/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ latex: latexCode })
      });
      if (!pdfResponse.ok) {
        throw new Error(`PDF generation error: ${pdfResponse.status}`);
      }
      const pdfBlob = await pdfResponse.blob();
      // Create an object URL for the generated PDF.
      const pdfObjectUrl = URL.createObjectURL(pdfBlob);
      print(pdfUrl)
      setPdfUrl(pdfObjectUrl);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(`PDF generation error: ${err.message}`);
    }
  };
  
  return (
    <>
      <style>
        {`
          .placeholder-light::placeholder {
            color: #9CA3AF !important;
            opacity: 1;
          }
          .btn-glow {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: box-shadow 0.3s ease-in-out;
          }
          .btn-glow:hover {
            box-shadow: 0 4px 12px var(--btn-glow-color);
          }
          .spinner-border {
            margin-right: 8px;
          }
        `}
      </style>
      <div className="container-fluid p-3 text-light" style={containerStyle}>
        <div className="mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="row mb-3">
            <div className="col">
              <h1>
                <a href="/" style={{ textDecoration: "none", color: "#ffffff" }}>
                  Hire<span style={{ color: "#3DFF74" }}>Tune</span>
                </a>
              </h1>
            </div>
            <div className="col text-end">
              <button className="btn btn-outline-light me-2">Sign In</button>
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
                  placeholder="Enter resume here (LaTeX format)"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
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
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
  
          {/* Error Message */}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
  
          {/* Action Buttons */}
          <div className="row mt-3">
            <div className="col">
              <div className="d-flex justify-content-center" style={{ gap: "10px" }}>
                <button className="btn btn-secondary btn-glow" style={button1}>
                  Save
                </button>
                <button className="btn btn-primary btn-glow" style={button2}>
                  Download
                </button>
                <button
                  className="btn btn-success btn-glow"
                  style={button3}
                  onClick={handleTuneResume}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    "Tune my resume"
                  )}
                </button>
              </div>
            </div>
          </div>
  
          {/* PDF/Result Preview */}
          <div className="row mt-4 justify-content-center">
            <div className="col-12">
              <div className="form-control" style={pdfFormView}>
                <div style={{ width: "100%", height: "400px", overflow: "auto", padding: "15px" }}>
                  {pdfUrl ? (
                    <iframe
                      title="Tuned Resume PDF"
                      src={pdfUrl}
                      style={{ width: "100%", height: "100%" }}
                    ></iframe>
                  ) : result ? (
                    // Fallback: You can also show JSON result if PDF URL isn’t available
                    <pre style={{ color: "#ffffff", textAlign: "left" }}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-center text-light p-5">
                      {isLoading ? "Processing your resume..." : "Tuned resume will appear here"}
                    </div>
                  )}
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
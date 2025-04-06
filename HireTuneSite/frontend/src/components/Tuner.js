import React, { useState, useEffect } from "react";
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
  margin: "0 auto",
  overflow: "hidden"
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
  const [userData, setUserData] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newApplication, setNewApplication] = useState({
    name: "",
    url: "",
    comments: ""
  });

  useEffect(() => {
    fetch('/api/current_user/', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => setUserData(data))
      .catch(err => console.error("Error fetching user:", err));
  }, []);

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
      console.log("Starting PDF generation with latex code length:", latexCode.length);
      
      const pdfResponse = await fetch("/api/generate-pdf/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ latex: latexCode })
      });
      
      console.log("PDF Response Status:", pdfResponse.status);
      
      // Log headers
      console.log("Response Headers:");
      for (const [key, value] of pdfResponse.headers.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      if (!pdfResponse.ok) {
        throw new Error(`API error: ${pdfResponse.status}`);
      }
      
      const pdfBlob = await pdfResponse.blob();
      console.log("PDF Blob received, size:", pdfBlob.size, "type:", pdfBlob.type);
      
      // Create an object URL for the generated PDF
      const pdfObjectUrl = URL.createObjectURL(pdfBlob);
      console.log("PDF URL created:", pdfObjectUrl);
      setPdfUrl(pdfObjectUrl);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(`PDF generation error: ${err.message}`);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) {
      setError("No PDF available to download");
      return;
    }
    
    try {
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "tuned_resume.pdf";
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError(`Failed to download PDF: ${err.message}`);
    }
  };

  const handleSaveResume = () => {
    if (!pdfUrl) {
      setError("No resume to save");
      return;
    }

    // Reset form data and show the modal
    setNewApplication({
      name: "",
      url: "",
      comments: ""
    });
    setShowSaveModal(true);
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setNewApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveApplication = async () => {
    if (!newApplication.name) {
      setError("Please enter a job title");
      return;
    }

    try {
      const response = await fetch("/api/save-application/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newApplication.name,
          url: newApplication.url,
          resume: pdfUrl,
          comments: newApplication.comments
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Hide modal
      setShowSaveModal(false);
      
      // Show success message
      setError(null);
      alert("Application saved successfully!");
    } catch (err) {
      setError(`Failed to save resume: ${err.message}`);
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
            iframe {
                border: none;
            }
        `}
      </style>
      <div className="container-fluid p-3 text-light" style={containerStyle}>
        <div className="mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="row mb-3 align-items-center">
            <div className="col">
              <h1>
                <a href="/" style={{ textDecoration: "none", color: "#ffffff" }}>
                  Hire<span style={{ color: "#3DFF74" }}>Tune</span>
                </a>
              </h1>
            </div>
            {userData && userData.is_authenticated ? (
              <div className="col d-flex align-items-center justify-content-end">
                <div className="d-flex align-items-center me-3">
                  {
                    <img
                      src={userData.avatar_hash ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar_hash}.png?size=32` : "https://cdn.discordapp.com/embed/avatars/0.png"}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "32px", height: "32px", objectFit: "cover" }}
                    />
                  }
                </div>
                <a href="/applications/" className="btn btn-outline-light me-2">
                  Applications
                </a>
                <a href="/api/logout/" className="btn btn-outline-danger">
                  Log Out
                </a>
              </div>
            ) : (
              <div className="col text-end">
                <a href="/tuner/auth/login/discord/?next=/tuner/" className="btn btn-outline-light">
                  Log In with Discord
                </a>
              </div>
            )}
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
                  placeholder="Enter job description or modification here"
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
                <button 
                  className="btn btn-secondary btn-glow" 
                  style={button1}
                  onClick={handleSaveResume}
                  disabled={!pdfUrl || isLoading}
                >
                  Save
                </button>
                <button 
                  className="btn btn-primary btn-glow" 
                  style={button2}
                  onClick={handleDownloadPDF}
                  disabled={!pdfUrl}
                >
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
                <div style={{ 
                  width: "100%", 
                  minHeight: "600px",
                  height: "auto",
                  overflow: "visible",
                  padding: "15px" 
                }}>
                  {pdfUrl ? (
                    <iframe
                      title="Tuned Resume PDF"
                      src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      style={{ 
                        width: "100%", 
                        height: "800px",
                        border: "none",
                        display: "block",
                        backgroundColor: "#fff", 
                        overflow: "hidden" 
                      }}
                    ></iframe>
                  ) : result ? (
                    <pre style={{ 
                      color: "#ffffff", 
                      textAlign: "left",
                      width: "100%",
                      height: "800px",
                      backgroundColor: "#1a1a1a",
                      padding: "20px",
                      margin: "0",
                      overflowY: "auto",
                      display: "block",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontFamily: "monospace",
                      whiteSpace: "pre-wrap"
                    }}>
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
      
      {/* Save Application Modal */}
      <div className={`modal fade ${showSaveModal ? 'show' : ''}`} 
        id="saveModal" 
        tabIndex="-1" 
        aria-labelledby="saveModalLabel" 
        aria-hidden={!showSaveModal}
        style={{ display: showSaveModal ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-light">
            <div className="modal-header">
              <h5 className="modal-title" id="saveModalLabel">Save Job Application</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowSaveModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-control bg-dark text-light"
                  id="name"
                  name="name"
                  value={newApplication.name}
                  onChange={handleApplicationChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="url" className="form-label">Job URL</label>
                <input
                  type="url"
                  className="form-control bg-dark text-light"
                  id="url"
                  name="url"
                  value={newApplication.url}
                  onChange={handleApplicationChange}
                  placeholder="https://example.com/job"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="comments" className="form-label">Comments</label>
                <textarea
                  className="form-control bg-dark text-light"
                  id="comments"
                  name="comments"
                  value={newApplication.comments}
                  onChange={handleApplicationChange}
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-glow" 
                onClick={handleSaveApplication}>
                Save Application
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal Background Overlay */}
      {showSaveModal && (
        <div 
          className="modal-backdrop fade show" 
          onClick={() => setShowSaveModal(false)}
        ></div>
      )}
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
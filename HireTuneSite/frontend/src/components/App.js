import React from "react";

const containerStyle = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  minHeight: "100vh"
};

const formDivStyle = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  borderWidth: 3,
  color: "#ffffff",
  height: 400,
  resize: "none",
  fontSize: "1.5em",
};

const pdfFormView = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  borderWidth: 3,
  maxWidth: "1000px",
  width: "100%",
  margin: "0 auto"
};

function App() {
  return (
    <>
      {/* Style tag for placeholder styling */}
      <style>
       {`
          .placeholder-light::placeholder {
            color: #9CA3AF !important;
            opacity: 1;
          }
        `}
      </style>
      <div className="container-fluid p-3 text-light" style={containerStyle}>
        {/* FIXED WIDTH CONTAINER FOR FORMS */}
        <div className="mx-auto" style={{ maxWidth: "1000px" }}>
        {/* Header Row */}
        <div className="row mb-3">
          <div className="col">
            <h1>
              Hire<span style={{ color: "#3DFF74" }}>Tune</span>
            </h1>
          </div>
          <div className="col text-end">
            <button className="btn btn-outline-light me-2">Sign In</button>
            <button className="btn btn-outline-light">Sign Up</button>
          </div>
        </div>
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
        </div>

        {/* Action Buttons Row */}
        <div className="row mt-3">
          <div className="col text-center">
            <button className="btn btn-secondary me-2">Save</button>
            <button className="btn btn-primary me-2">Download</button>
            <button className="btn btn-success">Tune my resume</button>
          </div>
        </div>

        {/* PDF Preview Row */}
        <div className="row mt-4 justify-content-center">
          <div className="col-12" style={{maxWidth: "1000px", margin: "0 auto"}}>
            <div className="form-control"
              style={pdfFormView}>
              <div
                className=""
                style={{ width: "100%", height: "400px"}}
              >
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
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

const button1 = {
  backgroundColor: "#CACACA",
  width: "30%",
  "--btn-glow-color": "rgba(202, 202, 202, 0.6)",
};

const button2 = {
  backgroundColor: "#3D6DFF",
  width: "30%",
  "--btn-glow-color": "rgba(61, 109, 255, 0.6)",
};

const button3 = {
  backgroundColor: "#3DFF74",
  width: "40%",
  "--btn-glow-color": "rgba(61, 255, 116, 0.6)",
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

  /* Glow effect for buttons */
  .btn-glow {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.3s ease-in-out;
  }

  .btn-glow:hover {
    /* Uses the custom property defined inline on each button */
    box-shadow: 0 4px 12px var(--btn-glow-color);
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
                  placeholder="Entdsaddsadasadaer resume here"
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
          <div className="col">
            <div className="d-flex justify-content-center" style={{ gap: "10px" }}>
              <button className="btn btn-secondary" style={button1}>Save</button>
              <button className="btn btn-primary" style={button2}>Download</button>
              <button className="btn btn-success" style={button3}>Tune my resume</button>
            </div>
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
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const containerStyle = {
  backgroundColor: "#030712",
  borderColor: "#1F2837",
  minHeight: "100vh"
};

const cardStyle = {
  backgroundColor: "#1a1a1a",
  borderColor: "#1F2837",
  borderWidth: 2,
  borderStyle: "solid",
  color: "#ffffff"
};

const statusBadgeStyle = (status) => {
  const colors = {
    'SUB': { bg: "#3D6DFF", text: "white" }, // Submitted - Blue
    'INT': { bg: "#FFBB33", text: "black" }, // Interview - Yellow
    'REJ': { bg: "#DC3545", text: "white" }, // Rejected - Red
    'OFF': { bg: "#3DFF74", text: "black" }  // Offer - Green
  };
  
  return {
    backgroundColor: colors[status]?.bg || "#6c757d",
    color: colors[status]?.text || "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontWeight: "bold",
    display: "inline-block"
  };
};

function ApplicationView() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [userData, setUserData] = useState(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    status: "",
    comments: ""
  });
  
  // Fetch user data first
  useEffect(() => {
    fetch('/api/current_user/', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => setUserData(data))
      .catch(err => console.error("Error fetching user:", err));
  }, []);
  
  // Fetch applications once we know the user is authenticated
  useEffect(() => {
    if (userData && userData.is_authenticated) {
      setIsLoading(true);
      fetch("/api/applications/")
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setApplications(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(`Error: ${err.message}`);
          console.error("Error fetching applications:", err);
          setIsLoading(false);
        });
    }
  }, [userData]);
  
  const handleEdit = (app) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      url: app.url || "",
      status: app.status,
      comments: app.comments || ""
    });
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/applications/${editingApp.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const updatedApp = await response.json();
      
      // Update applications state
      setApplications(applications.map(app => 
        app.id === editingApp.id ? updatedApp : app
      ));
      
      // Close modal
      const modalElement = document.getElementById('editModal');
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
      
      setEditingApp(null);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Error updating application:", err);
    }
  };
  
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this application?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/applications/${id}/`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Update applications state
      setApplications(applications.filter(app => app.id !== id));
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error("Error deleting application:", err);
    }
  };
  
  // Display login button if not logged in
  if (userData && !userData.is_authenticated) {
    return (
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
          </div>
          
          <div className="row justify-content-center mt-5">
            <div className="col-md-8 text-center">
              <h2>You need to log in to view your applications</h2>
              <p className="mt-3">Please sign in with Discord to access your saved applications.</p>
              <a href="/tuner/auth/login/discord/?next=/applications/" className="btn btn-outline-light">
                Sign In with Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <style>
        {`
          .btn-glow {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: box-shadow 0.3s ease-in-out;
          }
          .btn-glow:hover {
            box-shadow: 0 4px 12px rgba(61, 255, 116, 0.6);
          }
        `}
      </style>
      <div className="container-fluid p-3 text-light" style={containerStyle}>
        <div className="mx-auto" style={{ maxWidth: "1000px" }}>
          {/* Use the same header style as Tuner.js */}
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
                <a href="/api/logout/" className="btn btn-outline-danger">
                    Log Out
                </a>
              </div>
            ) : (
              <div className="col text-end">
                <a href="/tuner/auth/login/discord/?next=/applications/" className="btn btn-outline-light">
                  Log In with Discord
                </a>
              </div>
            )}
          </div>

          <div className="row mb-4">
            <div className="col">
              <h2>My Job Applications</h2>
            </div>
            <div className="col-auto">
              <a href="/tuner/" className="btn btn-outline-light btn-glow">
                Create New Application
              </a>
            </div>
          </div>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center my-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center my-5 p-5" style={cardStyle}>
              <h3>No applications yet</h3>
              <p className="mt-3">Get started by creating your first application in the tuner.</p>
              <a href="/tuner/" className="btn btn-primary mt-3 btn-glow">Go to Resume Tuner</a>
            </div>
          ) : (
            <div className="row row-cols-1 g-4">
              {applications.map(app => (
                <div className="col" key={app.id}>
                  <div className="card" style={cardStyle}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{app.name}</h5>
                        <span style={statusBadgeStyle(app.status)}>
                          {app.status === 'SUB' ? 'Submitted' : 
                           app.status === 'INT' ? 'Interview' : 
                           app.status === 'REJ' ? 'Rejected' : 
                           app.status === 'OFF' ? 'Offer' : 'Unknown'}
                        </span>
                      </div>
                      
                      {app.url && (
                        <p className="card-text">
                          <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-info">
                            View Job Posting
                          </a>
                        </p>
                      )}

                      <p className="card-text text-white mb-3">
                        <small>Created: {new Date(app.create_date).toLocaleDateString()}</small>
                      </p>
                      
                      {app.comments && (
                        <p className="card-text text-white">{app.comments}</p>
                      )}
                      
                      <div className="d-flex justify-content-end mt-3">
                        <a 
                          href={app.resume}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary me-2 btn-glow"
                        >
                          View Resume
                        </a>
                        <button 
                          className="btn btn-sm btn-outline-warning me-2 btn-glow"
                          onClick={() => handleEdit(app)}
                          data-bs-toggle="modal" 
                          data-bs-target="#editModal"
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger btn-glow"
                          onClick={() => handleDelete(app.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Edit Modal */}
        <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content bg-dark text-light">
              <div className="modal-header">
                <h5 className="modal-title" id="editModalLabel">Edit Application</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-light"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
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
                      value={formData.url}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      className="form-select bg-dark text-light"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="SUB">Submitted</option>
                      <option value="INT">Interview</option>
                      <option value="REJ">Rejected</option>
                      <option value="OFF">Offer</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="comments" className="form-label">Comments</label>
                    <textarea
                      className="form-control bg-dark text-light"
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" className="btn btn-primary btn-glow">Save Changes</button>
                  </div>
                </form>
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
    root.render(<ApplicationView />);
  }
});

export default ApplicationView;
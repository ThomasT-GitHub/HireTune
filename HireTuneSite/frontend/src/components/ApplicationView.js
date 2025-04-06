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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    resume: "",
    status: "",
    comments: ""
  });
  
  // Fetch user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user-info/");
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserInfo(data);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!isLoggedIn) return;
      
      setIsLoading(true);
      try {
        const response = await fetch("/api/applications/");
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(`Error: ${err.message}`);
        console.error("Error fetching applications:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isLoggedIn) {
      fetchApplications();
    }
  }, [isLoggedIn]);
  
  const handleEdit = (app) => {
    setEditingApp(app);
    setFormData({
      name: app.name,
      url: app.url,
      resume: app.resume,
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
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken")
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
      document.getElementById("editModal").classList.remove("show");
      document.querySelector(".modal-backdrop")?.remove();
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
      
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
        method: "DELETE",
        headers: {
          "X-CSRFToken": getCookie("csrftoken")
        }
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
  
  // Helper function to get CSRF token
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  
  // Display login button if not logged in
  if (!isLoggedIn) {
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
              <h2>You need to log in to view your saved resumes</h2>
              <p className="mt-3">Please sign in with Discord to access your saved applications.</p>
              <a href="/tuner/auth/login/discord/" className="btn btn-primary mt-3">
                <i className="bi bi-discord me-2"></i> Sign In with Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
          <div className="col text-end">
            {userInfo && (
              <div className="d-flex align-items-center justify-content-end">
                {userInfo.avatar_url && (
                  <img 
                    src={userInfo.avatar_url} 
                    alt="User avatar" 
                    className="rounded-circle me-2"
                    style={{ width: "32px", height: "32px" }} 
                  />
                )}
                <span className="me-3">{userInfo.username}</span>
                <a href="/tuner/auth/logout/" className="btn btn-outline-light btn-sm">Sign Out</a>
              </div>
            )}
          </div>
        </div>

        <div className="row mb-4">
          <div className="col">
            <h2>My Job Applications</h2>
            <p className="text-muted">Manage your saved applications and resumes</p>
          </div>
          <div className="col-auto">
            <a href="/tuner/" className="btn btn-outline-light">
              <i className="bi bi-plus-circle me-2"></i>Create New
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
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center my-5">
            <h3>No applications yet</h3>
            <p>Start by creating a new application in the tuner.</p>
            <a href="/tuner/" className="btn btn-primary mt-3">Go to Tuner</a>
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
                    
                    <p className="card-text text-muted mb-3">
                      <small>Created: {new Date(app.create_date).toLocaleDateString()}</small>
                    </p>
                    
                    {app.url && (
                      <p className="card-text">
                        <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-info">
                          <i className="bi bi-link-45deg me-1"></i>
                          Job Posting
                        </a>
                      </p>
                    )}
                    
                    {app.comments && (
                      <p className="card-text text-muted">{app.comments}</p>
                    )}
                    
                    <div className="d-flex justify-content-end mt-3">
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => window.open(app.resume, '_blank')}
                      >
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        View Resume
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => handleEdit(app)}
                        data-bs-toggle="modal" 
                        data-bs-target="#editModal"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(app.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
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
                    required
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
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
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
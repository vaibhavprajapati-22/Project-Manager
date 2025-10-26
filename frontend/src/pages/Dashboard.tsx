import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API = 'https://project-manager-1-vtqt.onrender.com/api';

function tokenHeaders(token: string | null) {
  return { 
    "Authorization": "Bearer " + token, 
    "Content-Type": "application/json" 
  };
}

interface Project {
  id: number;
  title: string;
  description?: string;
  tasks?: any[];
  createdAt?: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(''); 
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(API + "/projects", { 
        headers: tokenHeaders(token) 
      });
      if (res.ok) {
        setProjects(await res.json());
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      setProjects([]);
    }
    setLoading(false);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await fetch(API + "/projects", { 
        method: "POST", 
        headers: tokenHeaders(token), 
        body: JSON.stringify({ title, description }) 
      });
      setTitle("");
      setDescription("");
      load();
    } catch (error) {
      alert('Failed to create project');
    }
  }


  async function del(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;

    try {
      await fetch(API + "/projects/" + id, { 
        method: "DELETE", 
        headers: tokenHeaders(token) 
      });
      load();
    } catch (error) {
      alert('Failed to delete project');
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f7fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Create Project */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold', color: '#2d3748' }}>
            Create New Project
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            required
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '1rem',
            }}
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project description"
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '1rem',
            }}
          />
          <button
            onClick={create}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
          + Add Project
          </button>
        </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e2e8f0',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ marginTop: '1rem', color: '#718096' }}>Loading projects...</p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : projects.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
              No projects yet
            </h3>
            <p style={{ color: '#718096' }}>Create your first project to get started</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    📁
                  </div>
                  <button
                    onClick={(e) => del(project.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      color: '#cbd5e0',
                      fontSize: '1.25rem',
                      transition: 'color 0.2s',
                      lineHeight: 1
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#f56565'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}
                  >
                    🗑️
                  </button>
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem',
                  color: '#2d3748'
                }}>
                  {project.title}
                </h3>
                <p style={{ 
                  color: '#718096', 
                  marginBottom: '1rem',
                  minHeight: '1.5rem'
                }}>
                  {project.description || 'No description'}
                </p>
                <p style={{ 
                    color: '#a0aec0', 
                    fontSize: '0.875rem', 
                    marginTop: '0.5rem' 
                }}>
                    Started on: {new Date(project.createdAt || project.CreatedAt).toLocaleDateString()}
                </p>

                <div style={{ 
                  color: '#a0aec0', 
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📝</span>
                  {project.tasks ? project.tasks.length : 0} tasks
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API = 'https://project-manager-g5sp.onrender.com/api';


function tokenHeaders(token: string | null) {
  return { 
    "Authorization": "Bearer " + token, 
    "Content-Type": "application/json" 
  };
}

interface Task {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface Project {
  id: number;
  title: string;
  description: string;
  tasks: Task[];
}

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(API + "/projects/" + id, { 
        headers: tokenHeaders(token) 
      });
      if (res.ok) {
        setProject(await res.json());
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
    setLoading(false);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await fetch(API + "/projects/" + id + "/tasks", { 
        method: "POST", 
        headers: tokenHeaders(token), 
        body: JSON.stringify({ title: taskTitle }) 
      });
      setTaskTitle("");
      load();
    } catch (error) {
      alert('Failed to create task');
    }
  }

  async function toggle(tid: number, curr: boolean) {
    try {
      await fetch(API + "/tasks/" + tid + "?toggle=" + (!curr), { 
        method: "PUT", 
        headers: tokenHeaders(token), 
        body: JSON.stringify({ title: "" }) 
      });
      load();
    } catch (error) {
      alert('Failed to update task');
    }
  }

  async function del(tid: number) {
    try {
      await fetch(API + "/tasks/" + tid, { 
        method: "DELETE", 
        headers: tokenHeaders(token) 
      });
      load();
    } catch (error) {
      alert('Failed to delete task');
    }
  }

  if (!project) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 80px)', 
        background: '#f7fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #667eea',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: '1rem', color: '#718096' }}>Loading project...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  const tasks = project.tasks || [];
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#f7fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#667eea',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            <span>⬅️</span>
            Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {project.title}
          </h1>
          <p style={{ color: '#718096', fontSize: '1rem' }}>
            {project.description || 'No description'}
          </p>
        </div>

        {/* Progress */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>Progress</span>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>
              {completedCount} / {tasks.length}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: '#e2e8f0',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: `${progress}%`,
              transition: 'width 0.5s'
            }} />
          </div>
        </div>

        {/* Add Task */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            Add New Task
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title"
              onKeyPress={(e) => e.key === 'Enter' && addTask(e)}
              style={{
                flex: '1',
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
            <button
              onClick={addTask}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              <span>➕</span>
              Add
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div style={{
          background: 'white',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }} />
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                No tasks yet
              </h3>
              <p>Add your first task above to get started!</p>
            </div>
          ) : (
            tasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderTop: index > 0 ? '1px solid #e2e8f0' : 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f7fafc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <label style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '1rem',
                  flex: 1
                }}>
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggle(task.id, task.isCompleted)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#667eea'
                    }}
                  />
                  <span style={{
                    flex: '1',
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    color: task.isCompleted ? '#a0aec0' : '#2d3748',
                    fontSize: '1rem'
                  }}>
                    {task.title}
                  </span>
                </label>
                <button
                  onClick={() => del(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    color: '#cbd5e0',
                    fontSize: '1.25rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f56565'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e0'}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
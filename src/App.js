import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import ResumeBuilder from './components/ResumeBuilder';
import CareerRoadmap from './components/CareerRoadmap';
import Navigation from './components/Navigation';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>🎯 AI-Powered Resume & Career Assistant</h1>
          <p>Transform your career with AI-driven insights and personalized guidance</p>
        </header>
        <AuthForm onLogin={handleLogin} />
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} setCurrentPage={setCurrentPage} />;
      case 'resume':
        return <ResumeUpload user={user} />;
      case 'builder':
        return <ResumeBuilder user={user} />;
      case 'career':
        return <CareerRoadmap user={user} />;
      default:
        return <Dashboard user={user} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🎯 AI Career Assistant</h1>
          <div className="user-info">
            <span>Welcome, {user.fullName}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
      />

      <main className="main-content">
        {renderCurrentPage()}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 AI Career Assistant. Empowering your professional journey.</p>
      </footer>
    </div>
  );
}

export default App;
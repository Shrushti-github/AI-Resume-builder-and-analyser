import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';

const Dashboard = ({ user, setCurrentPage }) => {
  const [stats, setStats] = useState({
    resumesAnalyzed: 0,
    averageScore: 0,
    skillsImproved: 0,
    careerProgress: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Fetch resume history
      const resumeResponse = await fetch('http://localhost:5000/api/resume/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (resumeResponse.ok) {
        const resumeData = await resumeResponse.json();
        const resumes = resumeData.data || [];

        // Calculate stats
        const totalResumes = resumes.length;
        const averageScore = totalResumes > 0
          ? resumes.reduce((sum, resume) => sum + (resume.analysis?.overallScore || 0), 0) / totalResumes
          : 0;

        setStats(prev => ({
          ...prev,
          resumesAnalyzed: totalResumes,
          averageScore: Math.round(averageScore),
          skillsImproved: Math.floor(averageScore / 20),
          careerProgress: Math.min(averageScore, 85),
        }));

        // Set recent activity
        setRecentActivity(resumes.slice(0, 5).map(resume => ({
          id: resume._id,
          type: 'resume_analysis',
          description: `Analyzed resume: ${resume.fileName}`,
          score: resume.analysis?.overallScore || 0,
          date: new Date(resume.createdAt).toLocaleDateString(),
          time: new Date(resume.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setCurrentPage(action);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h2>Welcome back, {user.fullName}!</h2>
          <p className="user-role">Current Role: {user.currentRole} | Level: {user.experienceLevel}</p>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => handleQuickAction('resume')}>
            📄 Analyze Resume
          </button>
          <button className="action-btn secondary" onClick={() => handleQuickAction('builder')}>
            🛠️ Build Resume
          </button>
          <button className="action-btn secondary" onClick={() => handleQuickAction('career')}>
            🎯 Career Roadmap
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="main-panel">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon primary">📄</div>
                <h3>Resumes Analyzed</h3>
              </div>
              <div className="stat-value">{stats.resumesAnalyzed}</div>
              <div className="stat-label">Total uploads</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon secondary">⭐</div>
                <h3>Average Score</h3>
              </div>
              <div className="stat-value">{stats.averageScore}%</div>
              <div className="stat-label">Quality rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon warning">📈</div>
                <h3>Skills Improved</h3>
              </div>
              <div className="stat-value">{stats.skillsImproved}</div>
              <div className="stat-label">New competencies</div>
            </div>
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon primary">🎯</div>
                <h3>Career Progress</h3>
              </div>
              <div className="stat-value">{stats.careerProgress}%</div>
              <div className="stat-label">Growth trajectory</div>
            </div>
          </div>

          <div className="recent-activity">
            <h3>Recent Activity</h3>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>📄</div>
                  <div className="activity-content">
                    <h4>{activity.description}</h4>
                    <p>{activity.date} at {activity.time}</p>
                    {activity.score && (
                      <div className="activity-score">
                        Score: {activity.score}%
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent activity. Upload your first resume to get started!</p>
            )}
          </div>
        </div>

        <div className="sidebar-panel">
          <div className="insights-panel">
            <h3>Quick Insights</h3>
            <div className="insight-card">
              <div className="insight-icon primary">🎯</div>
              <div className="insight-content">
                <h4>Next Milestone</h4>
                <p>Complete your first resume analysis to unlock personalized feedback.</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon secondary">📚</div>
              <div className="insight-content">
                <h4>Recommended Learning</h4>
                <p>Based on your {user.experienceLevel} level, focus on foundational skills.</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon warning">⚡</div>
              <div className="insight-content">
                <h4>Quick Win</h4>
                <p>Update your skills profile to get tailored career recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h3>Your Learning Journey</h3>
        <div className="progress-track">
          <div className="progress-step completed">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Profile Setup</h4>
              <p>Complete ✅</p>
            </div>
            <div className="step-line completed"></div>
          </div>
          
          <div className={`progress-step ${stats.resumesAnalyzed > 0 ? 'completed' : 'current'}`}>
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Resume Analysis</h4>
              <p>{stats.resumesAnalyzed > 0 ? 'Complete ✅' : 'Upload your resume'}</p>
            </div>
            <div className={`step-line ${stats.resumesAnalyzed > 0 ? 'completed' : ''}`}></div>
          </div>
          
          <div className={`progress-step ${stats.averageScore > 70 ? 'completed' : 'upcoming'}`}>
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Resume Optimization</h4>
              <p>{stats.averageScore > 70 ? 'Complete ✅' : 'Improve your score'}</p>
            </div>
            <div className={`step-line ${stats.averageScore > 70 ? 'completed' : ''}`}></div>
          </div>
          
          <div className="progress-step upcoming">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Career Roadmap</h4>
              <p>Plan your growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
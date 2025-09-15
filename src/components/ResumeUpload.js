import React, { useState } from 'react';
import '../styles/ResumeUpload.css';
import axios from 'axios'; // Install: npm i axios

const ResumeUpload = ({ user }) => {
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ];

      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', targetRole || ''); // Send empty string if no role

      const token = localStorage.getItem('token'); // Assuming token is stored here after login
      const response = await axios.post('http://localhost:5000/api/resume/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token || ''}`, // Include token if available
          // Do NOT set 'Content-Type'; axios handles it with FormData
        },
        timeout: 30000, // 30-second timeout to handle slow network/server
      });

      // Safely handle response structure
      const responseData = response.data || {};
      const { success = false, data = {}, message = 'Unknown error' } = responseData;

      if (success) {
        const { analysis: newAnalysis = {}, suggestions = [] } = data;
        setAnalysis({
          analysis: {
            overallScore: newAnalysis.overallScore || 50, // Fallback if missing
            atsCompatibility: {
              score: newAnalysis.atsCompatibility?.score || 50,
              issues: newAnalysis.atsCompatibility?.issues || [],
              recommendations: newAnalysis.atsCompatibility?.recommendations || [],
            },
            keywordMatching: {
              matchPercentage: newAnalysis.keywordMatching?.matchPercentage || 0,
              matchedKeywords: newAnalysis.keywordMatching?.matchedKeywords || [],
              missingKeywords: newAnalysis.keywordMatching?.missingKeywords || [],
            },
          },
          suggestions: suggestions || [], // Already in the expected format from backend
        });
        setFile(null); // Clear file state on success
        setTargetRole(''); // Clear target role on success
        document.getElementById('file-input').value = ''; // Reset file input
      } else {
        setError(message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data || {},
        config: error.config, // Log request config for debugging
      });
      setError(
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED' ? 'Request timed out. Check server.' : 'Network error or server issue. Check console for details.')
      );
    } finally {
      setUploading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#ef4444'; // Red
    return '#6b7280'; // Gray
  };

  const renderAnalysisResults = () => {
    if (!analysis) return null;

    return (
      <div className="analysis-results">
        <h3>📊 Analysis Results</h3>

        <div className="score-overview">
          <div className="score-circle">
            <div
              className="score-value"
              style={{ color: getScoreColor(analysis.analysis.overallScore) }}
            >
              {analysis.analysis.overallScore}%
            </div>
            <div className="score-label">Overall Score</div>
          </div>

          <div className="score-breakdown">
            <div className="score-item">
              <span>ATS Compatibility</span>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${analysis.analysis.atsCompatibility.score}%`,
                    backgroundColor: getScoreColor(analysis.analysis.atsCompatibility.score),
                  }}
                ></div>
              </div>
              <span>{analysis.analysis.atsCompatibility.score}%</span>
            </div>

            <div className="score-item">
              <span>Keyword Match</span>
              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{
                    width: `${analysis.analysis.keywordMatching.matchPercentage}%`,
                    backgroundColor: getScoreColor(analysis.analysis.keywordMatching.matchPercentage),
                  }}
                ></div>
              </div>
              <span>{Math.round(analysis.analysis.keywordMatching.matchPercentage)}%</span>
            </div>
          </div>
        </div>

        <div className="analysis-details">
          <div className="detail-section">
            <h4>✅ Matched Keywords</h4>
            <div className="keyword-tags">
              {analysis.analysis.keywordMatching.matchedKeywords.length > 0 ? (
                analysis.analysis.keywordMatching.matchedKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag matched">
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="no-keywords">No keywords matched for the target role</p>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h4>❌ Missing Keywords</h4>
            <div className="keyword-tags">
              {analysis.analysis.keywordMatching.missingKeywords.length > 0 ? (
                analysis.analysis.keywordMatching.missingKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag missing">
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="no-keywords">Great! All relevant keywords are present</p>
              )}
            </div>
          </div>
        </div>

        <div className="suggestions-section">
          <h4>💡 Improvement Suggestions</h4>
          {analysis.suggestions.length > 0 ? (
            <div className="suggestions-list">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className={`suggestion-item ${suggestion.priority}`}>
                  <div className="suggestion-header">
                    <span className="suggestion-category">{suggestion.category}</span>
                    <span className={`priority-badge ${suggestion.priority}`}>
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <p>{suggestion.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No specific suggestions at this time. Your resume looks good!</p>
          )}
        </div>

        <div className="ats-feedback">
          <h4>🤖 ATS Compatibility Issues</h4>
          {analysis.analysis.atsCompatibility.issues.length > 0 ? (
            <ul className="issues-list">
              {analysis.analysis.atsCompatibility.issues.map((issue, index) => (
                <li key={index} className="issue-item">{issue}</li>
              ))}
            </ul>
          ) : (
            <p className="no-issues">✅ No ATS compatibility issues found!</p>
          )}

          {analysis.analysis.atsCompatibility.recommendations.length > 0 && (
            <div className="recommendations">
              <h5>Recommendations:</h5>
              <ul className="recommendations-list">
                {analysis.analysis.atsCompatibility.recommendations.map((rec, index) => (
                  <li key={index} className="recommendation-item">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <button className="btn-secondary" onClick={() => setAnalysis(null)}>
            Upload Another Resume
          </button>
          <button className="btn-primary" disabled>
            Generate Optimized Version
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="resume-upload">
      <div className="upload-header">
        <h2>📄 Resume Analysis</h2>
        <p>Upload your resume and get AI-powered insights to improve your chances of landing your dream job!</p>
      </div>

      {!analysis && (
        <div className="upload-section">
          <div className="upload-card">
            <div className="upload-area">
              <div className="upload-icon">📎</div>
              <h3>Upload Your Resume</h3>
              <p>Drag and drop your resume here, or click to browse</p>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="file-input"
              />
              <label htmlFor="file-input" className="file-label">
                {file ? file.name : 'Choose File'}
              </label>
              <div className="file-info">
                <small>Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)</small>
              </div>
            </div>

            <div className="target-role-section">
              <label htmlFor="targetRole">Target Role (Optional)</label>
              <input
                id="targetRole"
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Software Developer, Data Scientist, Product Manager"
                className="target-role-input"
              />
              <small>Specify the role you're targeting for better keyword analysis</small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="upload-btn"
            >
              {uploading ? (
                <>
                  <div className="btn-spinner"></div>
                  Analyzing Resume...
                </>
              ) : (
                'Analyze Resume'
              )}
            </button>
          </div>

          <div className="features-preview">
            <h3>What You'll Get:</h3>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">⭐</div>
                <h4>Overall Score</h4>
                <p>Get a comprehensive score based on industry standards</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🤖</div>
                <h4>ATS Compatibility</h4>
                <p>Ensure your resume passes Applicant Tracking Systems</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔍</div>
                <h4>Keyword Analysis</h4>
                <p>Match your resume to specific job requirements</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💡</div>
                <h4>Improvement Tips</h4>
                <p>Get actionable suggestions to enhance your resume</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderAnalysisResults()}
    </div>
  );
};

export default ResumeUpload;
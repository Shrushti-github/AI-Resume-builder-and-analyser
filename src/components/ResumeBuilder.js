import React, { useState, useEffect } from 'react';
import '../styles/ResumeBuilder.css';

const ResumeBuilder = ({ user }) => {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: user?.fullName || '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      portfolio: ''
    },
    summary: '',
    experience: [
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }
    ],
    education: [
      {
        institution: '',
        degree: '',
        field: '',
        startYear: '',
        endYear: ''
      }
    ],
    skills: {
      technical: [],
      soft: []
    },
    projects: [
      {
        name: '',
        description: '',
        technologies: '',
        link: ''
      }
    ]
  });

  const [currentSection, setCurrentSection] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  // Professional templates
  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and traditional design suitable for all industries'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with a focus on typography and whitespace'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold design for creative professionals and designers'
    },
    {
      id: 'minimalist',
      name: 'Minimalist',
      description: 'Simple and elegant design that focuses on content'
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Sophisticated design for senior-level professionals'
    }
  ];

  const handlePersonalInfoChange = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...resumeData.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setResumeData(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        }
      ]
    }));
  };

  const removeExperience = (index) => {
    if (resumeData.experience.length > 1) {
      setResumeData(prev => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index)
      }));
    }
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...resumeData.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setResumeData(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: '',
          degree: '',
          field: '',
          startYear: '',
          endYear: ''
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    if (resumeData.education.length > 1) {
      setResumeData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const addSkill = (type, skill) => {
    if (skill.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [type]: [...prev.skills[type], skill.trim()]
        }
      }));
    }
  };

  const removeSkill = (type, index) => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...resumeData.projects];
    newProjects[index] = {
      ...newProjects[index],
      [field]: value
    };
    setResumeData(prev => ({
      ...prev,
      projects: newProjects
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: '',
          description: '',
          technologies: '',
          link: ''
        }
      ]
    }));
  };

  const removeProject = (index) => {
    if (resumeData.projects.length > 1) {
      setResumeData(prev => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index)
      }));
    }
  };

  const saveResume = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/resume/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({...resumeData, template: selectedTemplate})
      });

      const data = await response.json();
      if (data.success) {
        alert('Resume saved successfully!');
      } else {
        alert(data.message || 'Failed to save resume');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Error saving resume');
    } finally {
      setSaving(false);
    }
  };

  const downloadResume = () => {
    const resumeHTML = generateResumeHTML();
    const element = document.createElement('a');
    const file = new Blob([resumeHTML], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const generateResumeHTML = () => {
    // Different HTML templates based on selected template
    const templateGenerators = {
      professional: generateProfessionalTemplate,
      modern: generateModernTemplate,
      creative: generateCreativeTemplate,
      minimalist: generateMinimalistTemplate,
      executive: generateExecutiveTemplate
    };
    
    return templateGenerators[selectedTemplate]();
  };

  const generateProfessionalTemplate = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo.fullName} - Resume</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 20px;
        }
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        .contact-info {
            font-size: 14px;
            color: #7f8c8d;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .experience-item, .education-item, .project-item {
            margin-bottom: 15px;
        }
        .item-title {
            font-weight: bold;
            font-size: 16px;
        }
        .item-subtitle {
            font-style: italic;
            color: #7f8c8d;
            margin-bottom: 5px;
        }
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill-tag {
            background-color: #ecf0f1;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${resumeData.personalInfo.fullName}</div>
        <div class="contact-info">
            ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
            ${resumeData.personalInfo.linkedIn ? '<br>LinkedIn: ' + resumeData.personalInfo.linkedIn : ''}
            ${resumeData.personalInfo.portfolio ? '<br>Portfolio: ' + resumeData.personalInfo.portfolio : ''}
        </div>
    </div>

    <div class="section">
        <div class="section-title">PROFESSIONAL SUMMARY</div>
        <p>${resumeData.summary}</p>
    </div>

    <div class="section">
        <div class="section-title">EXPERIENCE</div>
        ${resumeData.experience.map(exp => `
            <div class="experience-item">
                <div class="item-title">${exp.position} - ${exp.company}</div>
                <div class="item-subtitle">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                <p>${exp.description}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">EDUCATION</div>
        ${resumeData.education.map(edu => `
            <div class="education-item">
                <div class="item-title">${edu.degree} in ${edu.field}</div>
                <div class="item-subtitle">${edu.institution}, ${edu.startYear} - ${edu.endYear}</div>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <div class="section-title">SKILLS</div>
        <div class="skills-list">
            ${resumeData.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            ${resumeData.skills.soft.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
    </div>

    <div class="section">
        <div class="section-title">PROJECTS</div>
        ${resumeData.projects.map(project => `
            <div class="project-item">
                <div class="item-title">${project.name}</div>
                <p>${project.description}</p>
                <div class="item-subtitle">Technologies: ${project.technologies}</div>
                ${project.link ? `<div class="item-subtitle">Link: ${project.link}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>
    `.trim();
  };

  const generateModernTemplate = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo.fullName} - Resume</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background-color: #f9f9f9;
        }
        .resume-container {
            background: white;
            padding: 40px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .name {
            font-size: 32px;
            font-weight: 300;
            color: #2c3e50;
            margin-bottom: 10px;
            letter-spacing: 2px;
        }
        .contact-info {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 20px;
        }
        .divider {
            height: 2px;
            background: linear-gradient(to right, transparent, #3498db, transparent);
            margin: 25px 0;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #3498db;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        .experience-item, .education-item, .project-item {
            margin-bottom: 20px;
            position: relative;
            padding-left: 20px;
        }
        .experience-item:before, .education-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #3498db;
            font-size: 20px;
        }
        .item-title {
            font-weight: 600;
            font-size: 16px;
            color: #2c3e50;
        }
        .item-subtitle {
            color: #7f8c8d;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .skill-tag {
            background-color: #3498db;
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <div class="header">
            <div class="name">${resumeData.personalInfo.fullName}</div>
            <div class="contact-info">
                ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
                ${resumeData.personalInfo.linkedIn ? '<br>LinkedIn: ' + resumeData.personalInfo.linkedIn : ''}
                ${resumeData.personalInfo.portfolio ? '<br>Portfolio: ' + resumeData.personalInfo.portfolio : ''}
            </div>
        </div>

        <div class="divider"></div>

        <div class="section">
            <div class="section-title">PROFESSIONAL SUMMARY</div>
            <p>${resumeData.summary}</p>
        </div>

        <div class="divider"></div>

        <div class="section">
            <div class="section-title">EXPERIENCE</div>
            ${resumeData.experience.map(exp => `
                <div class="experience-item">
                    <div class="item-title">${exp.position} - ${exp.company}</div>
                    <div class="item-subtitle">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                    <p>${exp.description}</p>
                </div>
            `).join('')}
        </div>

        <div class="divider"></div>

        <div class="section">
            <div class="section-title">EDUCATION</div>
            ${resumeData.education.map(edu => `
                <div class="education-item">
                    <div class="item-title">${edu.degree} in ${edu.field}</div>
                    <div class="item-subtitle">${edu.institution}, ${edu.startYear} - ${edu.endYear}</div>
                </div>
            `).join('')}
        </div>

        <div class="divider"></div>

        <div class="section">
            <div class="section-title">SKILLS</div>
            <div class="skills-list">
                ${resumeData.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                ${resumeData.skills.soft.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>

        <div class="divider"></div>

        <div class="section">
            <div class="section-title">PROJECTS</div>
            ${resumeData.projects.map(project => `
                <div class="project-item">
                    <div class="item-title">${project.name}</div>
                    <p>${project.description}</p>
                    <div class="item-subtitle">Technologies: ${project.technologies}</div>
                    ${project.link ? `<div class="item-subtitle">Link: ${project.link}</div>` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `.trim();
  };

  // Additional template generators for creative, minimalist, and executive
  const generateCreativeTemplate = () => {
    // Creative template implementation
    return generateProfessionalTemplate(); // Placeholder
  };

  const generateMinimalistTemplate = () => {
    // Minimalist template implementation
    return generateProfessionalTemplate(); // Placeholder
  };

  const generateExecutiveTemplate = () => {
    // Executive template implementation
    return generateProfessionalTemplate(); // Placeholder
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: '👤' },
    { id: 'summary', name: 'Summary', icon: '📝' },
    { id: 'experience', name: 'Experience', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'skills', name: 'Skills', icon: '⚡' },
    { id: 'projects', name: 'Projects', icon: '🚀' }
  ];

  const renderPersonalInfo = () => (
    <div className="section-content">
      <h3>Personal Information</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={resumeData.personalInfo.fullName}
            onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
            placeholder="john.doe@email.com"
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={resumeData.personalInfo.location}
            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
            placeholder="City, State"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>LinkedIn</label>
          <input
            type="url"
            value={resumeData.personalInfo.linkedIn}
            onChange={(e) => handlePersonalInfoChange('linkedIn', e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
        <div className="form-group">
          <label>Portfolio/Website</label>
          <input
            type="url"
            value={resumeData.personalInfo.portfolio}
            onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)}
            placeholder="https://johndoe.dev"
          />
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="section-content">
      <h3>Professional Summary</h3>
      <div className="form-group">
        <label>Summary</label>
        <textarea
          value={resumeData.summary}
          onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
          rows="5"
        />
        <small>2-3 sentences highlighting your experience, key skills, and career objectives</small>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="section-content">
      <h3>Work Experience</h3>
      {resumeData.experience.map((exp, index) => (
        <div key={index} className="experience-item">
          <div className="item-header">
            <h4>Experience #{index + 1}</h4>
            <button 
              type="button" 
              onClick={() => removeExperience(index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                placeholder="Company Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Position *</label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                placeholder="Job Title"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                disabled={exp.current}
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                />
                Current Position
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
              placeholder="Describe your responsibilities and achievements..."
              rows="3"
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={addExperience} className="add-btn">
        Add Experience
      </button>
    </div>
  );

  const renderEducation = () => (
    <div className="section-content">
      <h3>Education</h3>
      {resumeData.education.map((edu, index) => (
        <div key={index} className="education-item">
          <div className="item-header">
            <h4>Education #{index + 1}</h4>
            <button 
              type="button" 
              onClick={() => removeEducation(index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Institution *</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                placeholder="University Name"
                required
              />
            </div>
            <div className="form-group">
              <label>Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                placeholder="Bachelor's, Master's, etc."
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Field of Study</label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                placeholder="Computer Science, Business, etc."
              />
            </div>
            <div className="form-group">
              <label>Start Year</label>
              <input
                type="number"
                value={edu.startYear}
                onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                placeholder="2020"
                min="1950"
                max="2030"
              />
            </div>
            <div className="form-group">
              <label>End Year</label>
              <input
                type="number"
                value={edu.endYear}
                onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                placeholder="2024"
                min="1950"
                max="2030"
              />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addEducation} className="add-btn">
        Add Education
      </button>
    </div>
  );

  const renderSkills = () => {
    return (
      <div className="section-content">
        <h3>Skills</h3>
        
        <div className="skills-section">
          <h4>Technical Skills</h4>
          <div className="skill-input-group">
            <input
              type="text"
              value={newTechnicalSkill}
              onChange={(e) => setNewTechnicalSkill(e.target.value)}
              placeholder="Add technical skill..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill('technical', newTechnicalSkill);
                  setNewTechnicalSkill('');
                }
              }}
            />
            <button 
              type="button"
              onClick={() => {
                addSkill('technical', newTechnicalSkill);
                setNewTechnicalSkill('');
              }}
              className="add-skill-btn"
            >
              Add
            </button>
          </div>
          <div className="skills-tags">
            {resumeData.skills.technical.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button 
                  type="button"
                  onClick={() => removeSkill('technical', index)}
                  className="remove-skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="skills-section">
          <h4>Soft Skills</h4>
          <div className="skill-input-group">
            <input
              type="text"
              value={newSoftSkill}
              onChange={(e) => setNewSoftSkill(e.target.value)}
              placeholder="Add soft skill..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill('soft', newSoftSkill);
                  setNewSoftSkill('');
                }
              }}
            />
            <button 
              type="button"
              onClick={() => {
                addSkill('soft', newSoftSkill);
                setNewSoftSkill('');
              }}
              className="add-skill-btn"
            >
              Add
            </button>
          </div>
          <div className="skills-tags">
            {resumeData.skills.soft.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
                <button 
                  type="button"
                  onClick={() => removeSkill('soft', index)}
                  className="remove-skill"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => (
    <div className="section-content">
      <h3>Projects</h3>
      {resumeData.projects.map((project, index) => (
        <div key={index} className="project-item">
          <div className="item-header">
            <h4>Project #{index + 1}</h4>
            <button 
              type="button" 
              onClick={() => removeProject(index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                value={project.name}
                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                placeholder="Project Name"
              />
            </div>
            <div className="form-group">
              <label>Technologies</label>
              <input
                type="text"
                value={project.technologies}
                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                placeholder="React, Node.js, MongoDB"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={project.description}
              onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
              placeholder="Describe the project and your role..."
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Project Link</label>
            <input
              type="url"
              value={project.link}
              onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>
        </div>
      ))}
      <button type="button" onClick={addProject} className="add-btn">
        Add Project
      </button>
    </div>
  );

  const renderTemplateSelector = () => (
    <div className="template-selector-overlay">
      <div className="template-selector">
        <h3>Choose a Resume Template</h3>
        <div className="template-grid">
          {templates.map(template => (
            <div 
              key={template.id} 
              className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <div className="template-preview">
                <div className="template-demo">
                  <div className="demo-header"></div>
                  <div className="demo-content">
                    <div className="demo-line"></div>
                    <div className="demo-line short"></div>
                    <div className="demo-line"></div>
                  </div>
                </div>
              </div>
              <div className="template-info">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="template-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowTemplateSelector(false)}
          >
            Cancel
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowTemplateSelector(false)}
          >
            Select Template
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'personal': return renderPersonalInfo();
      case 'summary': return renderSummary();
      case 'experience': return renderExperience();
      case 'education': return renderEducation();
      case 'skills': return renderSkills();
      case 'projects': return renderProjects();
      default: return renderPersonalInfo();
    }
  };

  if (previewMode) {
    return (
      <div className="resume-preview">
        <div className="preview-header">
          <button onClick={() => setPreviewMode(false)} className="btn-secondary">
            Back to Editor
          </button>
          <div className="template-selector-btn">
            <button 
              onClick={() => setShowTemplateSelector(true)}
              className="btn-secondary"
            >
              Change Template
            </button>
            <span>Selected: {templates.find(t => t.id === selectedTemplate)?.name}</span>
          </div>
          <button onClick={downloadResume} className="btn-primary">
            Download Resume
          </button>
        </div>
        <div className="resume-document">
          <iframe 
            title="resume-preview" 
            srcDoc={generateResumeHTML()} 
            style={{width: '100%', height: '100%', border: 'none'}}
          />
        </div>
        {showTemplateSelector && renderTemplateSelector()}
      </div>
    );
  }

  return (
    <div className="resume-builder">
      <div className="builder-header">
        <h2>Resume Builder</h2>
        <p>Create a professional resume step by step</p>
      </div>

      <div className="builder-container">
        <div className="builder-sidebar">
          <nav className="section-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`nav-item ${currentSection === section.id ? 'active' : ''}`}
                onClick={() => setCurrentSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.name}</span>
              </button>
            ))}
          </nav>
          
          <div className="action-buttons">
            <button 
              onClick={saveResume} 
              className="btn-secondary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={() => {
                setPreviewMode(true);
                setShowTemplateSelector(false);
              }} 
              className="btn-primary"
            >
              Preview Resume
            </button>
          </div>
        </div>

        <div className="builder-content">
          {renderCurrentSection()}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
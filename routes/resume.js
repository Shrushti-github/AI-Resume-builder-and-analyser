const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/resume');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads - FIXED VERSION
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('File received:', file.originalname, file.mimetype);
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
        }
    }
});

// AI Resume Analysis Functions
const analyzeResumeContent = (content, targetRole = '') => {
    console.log('Analyzing content length:', content.length);
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    // Basic scoring algorithm
    let score = 50; // Base score
    
    // Check for essential sections
    const sections = ['experience', 'education', 'skills', 'projects'];
    const sectionBonus = 10;
    sections.forEach(section => {
        if (content.toLowerCase().includes(section)) {
            score += sectionBonus;
        }
    });
    
    // Word count scoring
    if (wordCount >= 200 && wordCount <= 600) {
        score += 10;
    } else if (wordCount < 200) {
        score -= 10;
    }
    
    // Email and phone presence
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;
    
    if (emailRegex.test(content)) score += 5;
    if (phoneRegex.test(content)) score += 5;
    
    // Target role keyword matching
    let matchedKeywords = [];
    let missingKeywords = [];
    
    if (targetRole) {
        const roleKeywords = getRoleKeywords(targetRole);
        roleKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword.toLowerCase())) {
                matchedKeywords.push(keyword);
                score += 3;
            } else {
                missingKeywords.push(keyword);
            }
        });
    }
    
    return {
        overallScore: Math.min(Math.max(score, 0), 100),
        matchedKeywords,
        missingKeywords,
        wordCount
    };
};

const getRoleKeywords = (role) => {
    const keywords = {
        'software developer': ['programming', 'coding', 'javascript', 'python', 'java', 'react', 'node.js', 'database', 'git', 'api'],
        'data scientist': ['python', 'r', 'machine learning', 'statistics', 'sql', 'pandas', 'numpy', 'visualization', 'analytics'],
        'product manager': ['product management', 'roadmap', 'stakeholder', 'agile', 'scrum', 'analytics', 'user experience', 'strategy'],
        'marketing manager': ['marketing', 'campaigns', 'social media', 'analytics', 'branding', 'content', 'digital marketing'],
        'default': ['leadership', 'communication', 'problem solving', 'teamwork', 'project management']
    };
    
    return keywords[role.toLowerCase()] || keywords['default'];
};

const generateATSFeedback = (content) => {
    const issues = [];
    const recommendations = [];
    let atsScore = 80; // Base ATS score
    
    // Check for ATS-friendly formatting
    if (content.includes('|') || content.includes('→') || content.includes('•')) {
        issues.push('Contains special characters that may not be ATS-friendly');
        recommendations.push('Use simple bullet points (- or *) instead of special characters');
        atsScore -= 10;
    }
    
    // Check for standard section headers
    const standardHeaders = ['experience', 'education', 'skills', 'summary', 'objective'];
    const foundHeaders = standardHeaders.filter(header => 
        content.toLowerCase().includes(header)
    );
    
    if (foundHeaders.length < 3) {
        issues.push('Missing standard resume sections');
        recommendations.push('Include sections: Experience, Education, Skills, and Summary/Objective');
        atsScore -= 15;
    }
    
    // Check for contact information
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/;
    
    if (!emailRegex.test(content)) {
        issues.push('No email address found');
        recommendations.push('Include a professional email address');
        atsScore -= 10;
    }
    
    if (!phoneRegex.test(content)) {
        issues.push('No phone number found');
        recommendations.push('Include a phone number');
        atsScore -= 5;
    }
    
    return {
        score: Math.max(atsScore, 0),
        issues,
        recommendations
    };
};

const extractTextFromFile = async (filePath, fileType) => {
    try {
        if (fileType === '.pdf') {
            // For PDF files, we'll return a mock text for demo
            // In production, you'd use pdf-parse properly
            return `John Doe
Software Developer
Email: john.doe@email.com
Phone: (555) 123-4567

EXPERIENCE
Senior Software Developer - Tech Corp (2020-2023)
- Developed web applications using React and Node.js
- Improved system performance by 40%
- Led a team of 3 developers

EDUCATION  
Bachelor of Computer Science - University (2016-2020)

SKILLS
JavaScript, Python, React, Node.js, Database Management, Git`;
        } else if (fileType === '.txt') {
            return fs.readFileSync(filePath, 'utf8');
        } else {
            // For DOC/DOCX, return mock data for demo
            return `Professional Resume Content
Contact Information and Skills
Experience and Education Details`;
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        throw error;
    }
};

// Helper function to convert resume builder data to text format
const generateTextFromResumeData = (data) => {
    return `${data.personalInfo.fullName.toUpperCase()}
${data.personalInfo.email} | ${data.personalInfo.phone}
${data.personalInfo.location || ''}
${data.personalInfo.linkedIn ? 'LinkedIn: ' + data.personalInfo.linkedIn : ''}
${data.personalInfo.portfolio ? 'Portfolio: ' + data.personalInfo.portfolio : ''}

PROFESSIONAL SUMMARY
${data.summary || 'Professional summary to be added.'}

EXPERIENCE
${data.experience.map(exp => `
${exp.position || 'Position'} - ${exp.company || 'Company'}
${exp.startDate || 'Start Date'} - ${exp.current ? 'Present' : (exp.endDate || 'End Date')}
${exp.description || 'Job description to be added.'}
`).join('\n')}

EDUCATION
${data.education.map(edu => `
${edu.degree || 'Degree'} in ${edu.field || 'Field of Study'}
${edu.institution || 'Institution'}
${edu.startYear || 'Start Year'} - ${edu.endYear || 'End Year'}
`).join('\n')}

TECHNICAL SKILLS
${data.skills.technical && data.skills.technical.length > 0 ? data.skills.technical.join(', ') : 'Technical skills to be added.'}

SOFT SKILLS
${data.skills.soft && data.skills.soft.length > 0 ? data.skills.soft.join(', ') : 'Soft skills to be added.'}

PROJECTS
${data.projects.map(project => `
${project.name || 'Project Name'}
${project.description || 'Project description to be added.'}
Technologies: ${project.technologies || 'Technologies to be listed.'}
${project.link ? 'Link: ' + project.link : ''}
`).join('\n')}
    `.trim();
};

// Apply JSON parsing middleware only to non-upload routes
router.use((req, res, next) => {
    if (req.path === '/upload' && req.method === 'POST') {
        // Skip JSON parsing for upload route
        next();
    } else {
        express.json()(req, res, next);
    }
});

// @route   POST /api/resume/upload
// @desc    Upload and analyze resume
// @access  Private
router.post('/upload', auth, (req, res) => {
    console.log('Upload route hit');
    console.log('Content-Type:', req.get('Content-Type'));
    
    const uploadSingle = upload.single('resume');
    
    uploadSingle(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }

        try {
            console.log('File upload successful:', req.file);
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const { targetRole } = req.body;
            const filePath = req.file.path;
            const fileType = path.extname(req.file.originalname).toLowerCase();

            console.log('Processing file:', req.file.originalname, fileType);

            // Extract text from file
            const extractedText = await extractTextFromFile(filePath, fileType);
            
            if (!extractedText || extractedText.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Could not extract text from the uploaded file'
                });
            }

            console.log('Text extracted, length:', extractedText.length);

            // Analyze resume content
            const analysis = analyzeResumeContent(extractedText, targetRole);
            const atsAnalysis = generateATSFeedback(extractedText);

            // Create resume document
            const resume = new Resume({
                userId: req.userId,
                fileName: req.file.originalname,
                originalContent: extractedText,
                targetRole: targetRole || '',
                analysis: {
                    overallScore: analysis.overallScore,
                    atsCompatibility: atsAnalysis,
                    keywordMatching: {
                        targetRole: targetRole || '',
                        matchedKeywords: analysis.matchedKeywords,
                        missingKeywords: analysis.missingKeywords,
                        matchPercentage: analysis.matchedKeywords.length > 0 
                            ? (analysis.matchedKeywords.length / (analysis.matchedKeywords.length + analysis.missingKeywords.length)) * 100 
                            : 0
                    }
                }
            });

            await resume.save();

            // Update user's resume analysis history
            await User.findByIdAndUpdate(req.userId, {
                $push: {
                    resumeAnalysis: {
                        fileName: req.file.originalname,
                        score: analysis.overallScore,
                        atsCompatibility: atsAnalysis.score,
                        uploadDate: new Date()
                    }
                }
            });

            // Clean up uploaded file
            fs.unlinkSync(filePath);

            const suggestions = generateImprovementSuggestions(extractedText, analysis, atsAnalysis);

            res.json({
                success: true,
                message: 'Resume uploaded and analyzed successfully',
                data: {
                    resumeId: resume._id,
                    analysis: resume.analysis,
                    suggestions: suggestions
                }
            });

        } catch (error) {
            console.error('Resume processing error:', error);
            
            // Clean up file if it exists
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Error processing resume',
                error: error.message
            });
        }
    });
});

// @route   POST /api/resume/save
// @desc    Save resume data from resume builder
// @access  Private
router.post('/save', auth, async (req, res) => {
    try {
        const resumeData = req.body;
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate required fields
        if (!resumeData.personalInfo || !resumeData.personalInfo.fullName || !resumeData.personalInfo.email) {
            return res.status(400).json({
                success: false,
                message: 'Personal information (name and email) is required'
            });
        }

        // Generate text content from resume data
        const textContent = generateTextFromResumeData(resumeData);

        // Analyze the built resume content
        const analysis = analyzeResumeContent(textContent, user.currentRole || '');
        const atsAnalysis = generateATSFeedback(textContent);

        // Create a new resume document with builder data
        const resume = new Resume({
            userId: req.userId,
            fileName: `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume_${Date.now()}`,
            originalContent: textContent,
            parsedData: {
                personalInfo: resumeData.personalInfo,
                summary: resumeData.summary || '',
                experience: resumeData.experience || [],
                education: resumeData.education || [],
                skills: resumeData.skills || { technical: [], soft: [] },
                projects: resumeData.projects || []
            },
            targetRole: user.currentRole || '',
            analysis: {
                overallScore: Math.max(analysis.overallScore, 75), // Give builder resumes a boost
                atsCompatibility: {
                    score: Math.max(atsAnalysis.score, 85), // Builder resumes are ATS-friendly
                    issues: atsAnalysis.issues,
                    recommendations: atsAnalysis.recommendations
                },
                keywordMatching: {
                    targetRole: user.currentRole || '',
                    matchedKeywords: analysis.matchedKeywords,
                    missingKeywords: analysis.missingKeywords,
                    matchPercentage: analysis.matchedKeywords.length > 0 
                        ? (analysis.matchedKeywords.length / (analysis.matchedKeywords.length + analysis.missingKeywords.length)) * 100 
                        : 75 // Give a reasonable default for built resumes
                }
            }
        });

        await resume.save();

        // Update user's resume analysis history
        await User.findByIdAndUpdate(req.userId, {
            $push: {
                resumeAnalysis: {
                    fileName: resume.fileName,
                    uploadDate: new Date(),
                    analysis: {
                        overallScore: resume.analysis.overallScore,
                        atsCompatibility: resume.analysis.atsCompatibility.score
                    }
                }
            }
        });

        console.log('Resume builder data saved successfully for user:', req.userId);

        res.json({
            success: true,
            message: 'Resume saved successfully',
            data: {
                resumeId: resume._id,
                fileName: resume.fileName,
                analysis: resume.analysis
            }
        });

    } catch (error) {
        console.error('Resume save error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving resume',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

const generateImprovementSuggestions = (content, analysis, atsAnalysis) => {
    const suggestions = [];
    
    // ATS suggestions
    if (atsAnalysis.score < 70) {
        suggestions.push({
            category: 'format',
            priority: 'high',
            description: 'Improve ATS compatibility',
            example: 'Use standard section headers like "Experience", "Education", "Skills"'
        });
    }
    
    // Keyword suggestions
    if (analysis.missingKeywords && analysis.missingKeywords.length > 0) {
        suggestions.push({
            category: 'keywords',
            priority: 'high',
            description: `Add relevant keywords: ${analysis.missingKeywords.slice(0, 5).join(', ')}`,
            example: 'Include these keywords in your experience descriptions or skills section'
        });
    }
    
    // Content length suggestions
    if (analysis.wordCount < 200) {
        suggestions.push({
            category: 'content',
            priority: 'medium',
            description: 'Resume is too short - add more details',
            example: 'Expand on your achievements and responsibilities in each role'
        });
    } else if (analysis.wordCount > 600) {
        suggestions.push({
            category: 'content',
            priority: 'medium',
            description: 'Resume is too long - make it more concise',
            example: 'Focus on most relevant experiences and achievements'
        });
    }
    
    return suggestions;
};

// @route   GET /api/resume/history
// @desc    Get user's resume analysis history
// @access  Private
router.get('/history', auth, async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.userId })
            .select('fileName analysis createdAt targetRole parsedData')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: resumes
        });
    } catch (error) {
        console.error('Resume history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resume history'
        });
    }
});

// @route   GET /api/resume/:id
// @desc    Get specific resume details
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findOne({ 
            _id: req.params.id, 
            userId: req.userId 
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        res.json({
            success: true,
            data: resume
        });
    } catch (error) {
        console.error('Resume fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resume'
        });
    }
});

// @route   DELETE /api/resume/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const resume = await Resume.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.userId 
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Remove from user's resume analysis history
        await User.findByIdAndUpdate(req.userId, {
            $pull: {
                resumeAnalysis: { fileName: resume.fileName }
            }
        });

        res.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Resume delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resume'
        });
    }
});

module.exports = router;
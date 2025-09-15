const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Career roadmap data
const careerData = {
    'software developer': {
        levels: ['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'],
        skills: {
            'Junior': ['HTML/CSS', 'JavaScript', 'Git', 'Basic algorithms'],
            'Mid-level': ['React/Vue', 'Node.js', 'Database design', 'Testing', 'API design'],
            'Senior': ['System design', 'Mentoring', 'Architecture', 'Performance optimization'],
            'Lead': ['Team leadership', 'Project management', 'Technical strategy', 'Cross-team collaboration'],
            'Principal': ['Technical vision', 'Company-wide impact', 'Industry expertise', 'Innovation leadership']
        },
        learningResources: {
            'Junior': [
                { title: 'JavaScript Fundamentals', url: 'https://javascript.info/', type: 'tutorial', priority: 'high' },
                { title: 'Git Handbook', url: 'https://guides.github.com/introduction/git-handbook/', type: 'tutorial', priority: 'high' },
                { title: 'FreeCodeCamp', url: 'https://freecodecamp.org', type: 'course', priority: 'high' }
            ],
            'Mid-level': [
                { title: 'React Documentation', url: 'https://reactjs.org/docs/', type: 'tutorial', priority: 'high' },
                { title: 'Node.js Best Practices', url: 'https://nodejs.dev/learn', type: 'tutorial', priority: 'high' },
                { title: 'Database Design Course', url: 'https://www.coursera.org/learn/database-design', type: 'course', priority: 'medium' }
            ],
            'Senior': [
                { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'tutorial', priority: 'high' },
                { title: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net/', type: 'book', priority: 'high' },
                { title: 'AWS Solutions Architect', url: 'https://aws.amazon.com/certification/', type: 'certification', priority: 'medium' }
            ]
        }
    },
    'data scientist': {
        levels: ['Junior', 'Mid-level', 'Senior', 'Principal', 'Chief Data Scientist'],
        skills: {
            'Junior': ['Python/R', 'SQL', 'Statistics', 'Data visualization', 'Pandas/NumPy'],
            'Mid-level': ['Machine Learning', 'Feature engineering', 'A/B testing', 'Big data tools', 'Model deployment'],
            'Senior': ['Advanced ML', 'Deep learning', 'MLOps', 'Business strategy', 'Team leadership'],
            'Principal': ['Research leadership', 'Strategic planning', 'Cross-functional collaboration', 'Innovation'],
            'Chief Data Scientist': ['Executive leadership', 'Data strategy', 'Organizational impact', 'Industry thought leadership']
        },
        learningResources: {
            'Junior': [
                { title: 'Python for Data Science', url: 'https://www.coursera.org/learn/python-data-science', type: 'course', priority: 'high' },
                { title: 'Statistics for Data Science', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course', priority: 'high' },
                { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/', type: 'tutorial', priority: 'medium' }
            ],
            'Mid-level': [
                { title: 'Machine Learning Course', url: 'https://www.coursera.org/learn/machine-learning', type: 'course', priority: 'high' },
                { title: 'Hands-On Machine Learning', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/', type: 'book', priority: 'high' },
                { title: 'A/B Testing Course', url: 'https://www.udacity.com/course/ab-testing--ud257', type: 'course', priority: 'medium' }
            ]
        }
    },
    'product manager': {
        levels: ['Associate PM', 'Product Manager', 'Senior PM', 'Principal PM', 'VP Product'],
        skills: {
            'Associate PM': ['Market research', 'User interviews', 'Basic analytics', 'Wireframing', 'Agile basics'],
            'Product Manager': ['Product strategy', 'Roadmap planning', 'A/B testing', 'Stakeholder management', 'Data analysis'],
            'Senior PM': ['Strategic planning', 'Team leadership', 'Advanced analytics', 'Go-to-market', 'P&L management'],
            'Principal PM': ['Vision setting', 'Cross-product strategy', 'Executive communication', 'Innovation leadership'],
            'VP Product': ['Product organization', 'Strategic direction', 'Team building', 'Company-wide impact']
        },
        learningResources: {
            'Associate PM': [
                { title: 'Product Management Fundamentals', url: 'https://www.coursera.org/learn/uva-darden-product-management', type: 'course', priority: 'high' },
                { title: 'User Interview Techniques', url: 'https://www.nngroup.com/articles/interviewing-users/', type: 'tutorial', priority: 'high' }
            ],
            'Product Manager': [
                { title: 'Inspired by Marty Cagan', url: 'https://svpg.com/inspired-how-to-create-products-customers-love/', type: 'book', priority: 'high' },
                { title: 'Google Analytics Certification', url: 'https://analytics.google.com/analytics/academy/', type: 'certification', priority: 'medium' }
            ]
        }
    }
};

// Helper function to generate career roadmap
const generateCareerRoadmap = (roleData, currentLevel, timeframe = 12) => {
    const levels = roleData.levels;
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = currentIndex >= 0 && currentIndex < levels.length - 1 
        ? levels[currentIndex + 1] 
        : levels[levels.length - 1];

    // Get skills for next level
    const skillsToLearn = roleData.skills[nextLevel] || [];
    const resources = roleData.learningResources[nextLevel] || [];

    // Generate milestones based on timeframe
    const milestones = [];
    const monthsPerMilestone = Math.ceil(timeframe / 4);

    milestones.push({
        title: 'Skill Assessment & Planning',
        description: 'Complete current skill assessment and create learning plan',
        targetDate: new Date(Date.now() + (monthsPerMilestone * 30 * 24 * 60 * 60 * 1000)),
        completed: false
    });

    milestones.push({
        title: 'Core Skills Development',
        description: `Master 50% of ${nextLevel} level skills`,
        targetDate: new Date(Date.now() + (monthsPerMilestone * 2 * 30 * 24 * 60 * 60 * 1000)),
        completed: false
    });

    milestones.push({
        title: 'Practical Application',
        description: 'Complete projects demonstrating new skills',
        targetDate: new Date(Date.now() + (monthsPerMilestone * 3 * 30 * 24 * 60 * 60 * 1000)),
        completed: false
    });

    milestones.push({
        title: 'Level Transition Ready',
        description: `Ready for ${nextLevel} level responsibilities`,
        targetDate: new Date(Date.now() + (timeframe * 30 * 24 * 60 * 60 * 1000)),
        completed: false
    });

    return {
        currentLevel,
        nextLevel,
        skillsToLearn,
        resources: resources.slice(0, 5),
        milestones,
        estimatedTimeframe: timeframe,
        progressSteps: levels.slice(currentIndex, currentIndex + 2)
    };
};

// @route   POST /api/career/roadmap
// @desc    Generate personalized career roadmap
// @access  Private
router.post('/roadmap', auth, async (req, res) => {
    try {
        const { targetRole, currentLevel, timeframe } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get career data for the target role
        const roleData = careerData[targetRole.toLowerCase()] || careerData['software developer'];
        
        // Generate roadmap based on current level and target
        const roadmap = generateCareerRoadmap(roleData, currentLevel, timeframe);

        // Static career advice (replacing AI advice)
        const staticAdvice = `Focus on developing core skills (${roadmap.skillsToLearn.join(', ')}) and gaining practical experience in ${targetRole}. Utilize the recommended resources to progress to the ${roadmap.nextLevel} level.`;

        // Update user's career roadmap
        user.careerRoadmap = {
            currentLevel: currentLevel,
            targetLevel: roadmap.nextLevel,
            recommendedSkills: roadmap.skillsToLearn,
            learningResources: roadmap.resources,
            milestones: roadmap.milestones,
            aiAdvice: staticAdvice // Replaced AI advice with static text
        };

        await user.save();

        res.json({
            success: true,
            message: 'Career roadmap generated successfully',
            data: {
                ...roadmap,
                aiAdvice: staticAdvice // Replaced AI advice with static text
            }
        });

    } catch (error) {
        console.error('Career roadmap error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating career roadmap'
        });
    }
});

// @route   GET /api/career/skills
// @desc    Get skill recommendations based on role
// @access  Private
router.get('/skills/:role', auth, async (req, res) => {
    try {
        const { role } = req.params;
        const { level } = req.query;

        const roleData = careerData[role.toLowerCase()];
        
        if (!roleData) {
            return res.status(404).json({
                success: false,
                message: 'Role not found in our database'
            });
        }

        const skills = roleData.skills[level] || roleData.skills['Junior'];
        const resources = roleData.learningResources[level] || roleData.learningResources['Junior'] || [];

        res.json({
            success: true,
            data: {
                role: role,
                level: level,
                requiredSkills: skills,
                learningResources: resources
            }
        });

    } catch (error) {
        console.error('Skills fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching skill recommendations'
        });
    }
});

// @route   GET /api/career/trends
// @desc    Get industry trends and job market insights
// @access  Private
router.get('/trends/:role', auth, async (req, res) => {
    try {
        const { role } = req.params;

        // Mock data for trends
        const trends = {
            'software developer': {
                demandGrowth: '+15%',
                averageSalary: '$95,000',
                topSkills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
                emergingTrends: ['AI/ML integration', 'Microservices', 'DevOps practices'],
                jobOpportunities: 150000,
                remoteWorkPercentage: '68%'
            },
            'data scientist': {
                demandGrowth: '+22%',
                averageSalary: '$120,000',
                topSkills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
                emergingTrends: ['MLOps', 'AutoML', 'Ethical AI', 'Edge computing'],
                jobOpportunities: 45000,
                remoteWorkPercentage: '72%'
            },
            'product manager': {
                demandGrowth: '+8%',
                averageSalary: '$115,000',
                topSkills: ['Product Strategy', 'Analytics', 'User Research', 'Agile', 'A/B Testing'],
                emergingTrends: ['AI-powered products', 'Voice interfaces', 'Sustainability focus'],
                jobOpportunities: 35000,
                remoteWorkPercentage: '65%'
            }
        };

        const roleTrends = trends[role.toLowerCase()] || trends['software developer'];

        res.json({
            success: true,
            data: {
                role: role,
                trends: roleTrends,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Trends fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching career trends'
        });
    }
});

module.exports = router;
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalContent: {
        type: String,
        required: true
    },
    parsedData: {
        personalInfo: {
            name: { type: String, default: null },
            email: { type: String, default: null },
            phone: { type: String, default: null },
            location: { type: String, default: null },
            linkedIn: { type: String, default: null },
            portfolio: { type: String, default: null }
        },
        summary: { type: String, default: null },
        experience: [{
            company: { type: String, default: null },
            position: { type: String, default: null },
            duration: { type: String, default: null },
            description: { type: String, default: null },
            achievements: [{ type: String, default: null }]
        }],
        education: [{
            institution: { type: String, default: null },
            degree: { type: String, default: null },
            field: { type: String, default: null },
            year: { type: String, default: null },
            gpa: { type: String, default: null }
        }],
        skills: {
            technical: [{ type: String, default: null }],
            soft: [{ type: String, default: null }],
            languages: [{ type: String, default: null }],
            tools: [{ type: String, default: null }]
        },
        projects: [{
            name: { type: String, default: null },
            description: { type: String, default: null },
            technologies: [{ type: String, default: null }],
            link: { type: String, default: null }
        }],
        certifications: [{
            name: { type: String, default: null },
            issuer: { type: String, default: null },
            date: { type: String, default: null },
            expiryDate: { type: String, default: null }
        }]
    },
    analysis: {
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        atsCompatibility: {
            score: {
                type: Number,
                min: 0,
                max: 100,
                default: 0
            },
            issues: [{ type: String, default: [] }],
            recommendations: [{ type: String, default: [] }]
        },
        keywordMatching: {
            targetRole: { type: String, default: '' },
            matchedKeywords: [{ type: String, default: [] }],
            missingKeywords: [{ type: String, default: [] }],
            matchPercentage: { type: Number, default: 0 }
        }
    },
    improvements: {
        suggestions: [{
            category: { type: String, default: '' }, // 'format', 'content', 'keywords', 'structure'
            priority: { type: String, default: '' }, // 'high', 'medium', 'low'
            description: { type: String, default: '' },
            example: { type: String, default: '' }
        }],
        optimizedVersion: { type: String, default: null }
    },
    targetRole: { type: String, default: '' },
    industryFocus: { type: String, default: '' }
}, {
    timestamps: true
});

// Index for faster queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ targetRole: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
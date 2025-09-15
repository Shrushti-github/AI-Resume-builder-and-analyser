const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    currentRole: {
        type: String,
        required: [true, 'Current role is required'],
        trim: true
    },
    experienceLevel: {
        type: String,
        required: [true, 'Experience level is required'],
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner'
    },
    skills: [{
        type: String,
        trim: true
    }],
    targetRole: {
        type: String,
        trim: true
    },
    resumeAnalysis: [{
        fileName: { type: String, required: true },
        uploadDate: { type: Date, default: Date.now },
        analysis: {
            overallScore: { type: Number, default: 0 },
            atsCompatibility: { type: Number, default: 0 }
        }
    }],
    careerRoadmap: {
        currentLevel: String,
        targetLevel: String,
        recommendedSkills: [String],
        learningResources: [{
            title: String,
            url: String,
            type: String, // 'course', 'book', 'tutorial', 'certification'
            priority: String // 'high', 'medium', 'low'
        }],
        milestones: [{
            title: String,
            description: String,
            completed: { type: Boolean, default: false },
            targetDate: Date
        }],
        aiAdvice: { type: String, default: '' }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
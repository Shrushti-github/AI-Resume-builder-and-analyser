const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const careerRoutes = require('./routes/career');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}

// Middleware - ORDER IS CRITICAL
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// DO NOT use express.json() before multer routes - this is the main issue!
// app.use(express.json({ limit: '10mb' })); // REMOVE THIS LINE

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add this middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Content-Type:', req.get('Content-Type'));
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://your-connection-string', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB successfully!');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Routes - BEFORE JSON middleware for upload route
app.use('/api/resume', resumeRoutes);

// NOW add JSON middleware for other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/career', careerRoutes);

// Add a simple route to test if server is working
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Server is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        uploadsDir: fs.existsSync(uploadDir) ? 'Exists' : 'Missing'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Uploads directory: ${uploadDir}`);
});
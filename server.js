const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS (important for frontend)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://task-frontend-xi-kohl.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173"
    ];

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.startsWith("http://localhost")
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true
}));

app.options("*", cors());

// Body parser
app.use(express.json());

// Validate ENV (do not crash, just log)
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI missing");
}
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET missing");
}

// Mongo connection
mongoose.set('strictQuery', false);

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err.message));
} else {
  console.error("Skipping MongoDB connection");
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

// Health check (very useful for Render)
app.get('/health', (req, res) => {
  res.json({
    status: "OK",
    mongo: mongoose.connection.readyState
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// Start server
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
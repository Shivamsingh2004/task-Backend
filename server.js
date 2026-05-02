const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    try {
      if (
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost")
      ) {
        return callback(null, true);
      }
    } catch (err) {
      return callback(null, false);
    }

    return callback(new Error("CORS not allowed: " + origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// 🔴 Validate ENV (prevents silent crashes)
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI missing");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET missing");
  process.exit(1);
}

// Mongo connection
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  family: 4,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));

// Health
app.get('/', (req, res) => {
  res.json({ message: 'Team Task Manager API is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: "OK" });
});

// 🔴 Global error handler (prevents 500 mystery)
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://taskmanagement-61fk.vercel.app",
  process.env.CLIENT_URL
]
  .filter(Boolean)
  .map((url) => url.replace(/\/$/, ""));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("Not allowed by CORS: " + origin)
    );
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

// Test Route
app.get("/", (req, res) => {
  res.send("Project Task Management API is running!");
});

// Get All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Could not fetch tasks" });
  }
});

// Add New Task
app.post("/tasks", async (req, res) => {
  try {
    const title = req.body.title;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    const task = await Task.create({
      title: title.trim()
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ message: "Could not create task" });
  }
});

// Update Task Status
app.patch("/tasks/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Ongoing", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid task status"
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({
      message: "Could not update task"
    });
  }
});

// Delete Task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully"
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(400).json({
      message: "Could not delete task"
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

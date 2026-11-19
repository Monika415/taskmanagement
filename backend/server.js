
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.CLIENT_URL
  ].filter(Boolean)
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const taskSchema = new mongoose.Schema({
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
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

app.get("/", (req, res) => {
  res.send("Project Task Management API is running!");
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch tasks" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const title = req.body.title;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    const task = await Task.create({ title: title.trim() });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Could not create task" });
  }
});

app.patch("/tasks/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Ongoing", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    res.status(400).json({ message: "Could not update task" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Could not delete task" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

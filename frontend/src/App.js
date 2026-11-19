
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API = "https://taskmanagement-cayp.onrender.com/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    try {
      setError("");
      const response = await axios.get(API);
      setTasks(response.data);
    } catch (err) {
      setError("Unable to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    try {
      await axios.post(API, { title: title.trim() });
      setTitle("");
      await loadTasks();
    } catch (err) {
      alert("Unable to add task. Please try again.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/${id}`, { status });
      await loadTasks();
    } catch (err) {
      alert("Unable to update task.");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axios.delete(`${API}/${id}`);
      await loadTasks();
    } catch (err) {
      alert("Unable to delete task.");
    }
  };

  const statuses = ["Pending", "Ongoing", "Completed"];

  return (
    <div className="app-container">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="main-title">Project Task Management</h1>
          <p className="subtitle">
            Organize your work and track your progress
          </p>
        </div>

        <div className="task-form card shadow-sm p-4 mb-5">
          <form onSubmit={addTask}>
            <label className="form-label fw-semibold">
              Create a New Task
            </label>

            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your task title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <button className="btn btn-primary px-4" type="submit">
                + Add Task
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <p className="text-center">Loading tasks...</p>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        <div className="row g-4">
          {statuses.map((status) => {
            const filteredTasks = tasks.filter(
              (task) => task.status === status
            );

            return (
              <div className="col-md-4" key={status}>
                <div className={`task-column ${status.toLowerCase()}`}>
                  <div className="column-heading">
                    <h5>{status}</h5>
                    <span className="task-count">
                      {filteredTasks.length}
                    </span>
                  </div>

                  <div className="task-list">
                    {filteredTasks.map((task) => (
                      <div className="task-card" key={task._id}>
                        <h6>{task.title}</h6>

                        <span className={`status-label ${status.toLowerCase()}`}>
                          {task.status}
                        </span>

                        <div className="task-actions">
                          {status !== "Pending" && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                updateStatus(task._id, "Pending")
                              }
                            >
                              Pending
                            </button>
                          )}

                          {status !== "Ongoing" && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() =>
                                updateStatus(task._id, "Ongoing")
                              }
                            >
                              Ongoing
                            </button>
                          )}

                          {status !== "Completed" && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() =>
                                updateStatus(task._id, "Completed")
                              }
                            >
                              Complete
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteTask(task._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}

                    {!loading && filteredTasks.length === 0 && (
                      <p className="empty-message">
                        No tasks available.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

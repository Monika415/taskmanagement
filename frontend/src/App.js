
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API = "http://localhost:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const loadTasks = async () => {
    try {
      const res = await axios.get(API);
      setTasks(res.data);
    } catch (error) {
      console.log("Backend is not connected yet.");
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) {
      alert("Please enter a task");
      return;
    }

    try {
      await axios.post(API, { title });
      setTitle("");
      loadTasks();
    } catch (error) {
      alert("Start the backend server first.");
    }
  };

  const updateStatus = async (id, status) => {
    await axios.patch(`${API}/${id}`, { status });
    loadTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/${id}`);
    loadTasks();
  };

  const statuses = ["Pending", "Ongoing", "Completed"];

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">
        Project Task Management
      </h1>

      <div className="input-group mb-4">
        <input
          className="form-control"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="btn btn-primary" onClick={addTask}>
          Add Task
        </button>
      </div>

      <div className="row">
        {statuses.map((status) => (
          <div className="col-md-4 mb-3" key={status}>
            <div className="card shadow h-100">
              <div className="card-header bg-primary text-white">
                {status} Tasks
              </div>

              <div className="card-body">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div className="border rounded p-3 mb-3" key={task._id}>
                      <h5>{task.title}</h5>
                      <p>Status: {task.status}</p>

                      {status !== "Ongoing" && (
                        <button
                          className="btn btn-info btn-sm me-2 mb-2"
                          onClick={() => updateStatus(task._id, "Ongoing")}
                        >
                          Ongoing
                        </button>
                      )}

                      {status !== "Completed" && (
                        <button
                          className="btn btn-success btn-sm me-2 mb-2"
                          onClick={() => updateStatus(task._id, "Completed")}
                        >
                          Complete
                        </button>
                      )}

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                {tasks.filter((task) => task.status === status).length === 0 && (
                  <p className="text-muted">No tasks available.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

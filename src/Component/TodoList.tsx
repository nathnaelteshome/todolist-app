import axios from "axios";
import { SetStateAction, useEffect, useState } from "react";
import "./style.css";

const TodoList: React.FC = () => {
  const fetchTodos = async () => {
    try {
      const response = await axios.get(
        "https://jsonplaceholder.typicode.com/todos?_limit=4"
      );
      setIsLoading(false);
      console.log("Todos fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error fetching todos:", error);
      setIsLoading(false);
    }
  };

  const getlocalStorage = () => {
    let list = localStorage.getItem("tasks");
    if (list) {
      return (list = JSON.parse(localStorage.getItem("tasks") || ""));
    } else {
      return fetchTodos();
    }
  };

  // State variables
  const [tasks, setTasks] =
    useState<{ id: number; title: string; completed: boolean }[]>(
      getlocalStorage
    ); // Holds the list of tasks
  const [inputValue, setInputValue] = useState(""); // Holds the value of the input field
  const [filter, setFilter] = useState("all"); // Holds the current filter type
  const [isLoading, setIsLoading] = useState(true); // Indicates whether the data is being loaded
  const [editTaskId, setEditTaskId] = useState<number | null>(null); // Holds the ID of the task being edited

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const savedTasks = localStorage.getItem("tasks");

      console.log(
        "savedTasks:",
        savedTasks,
        "Type:",
        typeof savedTasks,
        "Length:",
        savedTasks?.length
      );
      console.log("possible", savedTasks);

      if (savedTasks && savedTasks !== "[]") {
        console.log("Using saved tasks", savedTasks);
        setTasks(JSON.parse(savedTasks));
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  console.log("tasks", tasks);
  // Fetch todos from an API

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Add a new task
  const handleAddTask = async () => {
    if (inputValue.trim() === "") {
      return;
    }

    const newTask = {
      id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
      title: inputValue,
      completed: false,
    };

    try {
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setInputValue("");
    } catch (error) {
      console.log("Error adding task:", error);
    }
  };

  // Handle checkbox change for a task
  const handleTaskCheckboxChange = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Delete a task
  const handleDeleteTask = (taskId: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  // Edit a task
  const handleEditTask = (taskId: number) => {
    setEditTaskId(taskId);
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setInputValue(taskToEdit.title);
    }
  };

  // Update a task
  const handleUpdateTask = async () => {
    if (inputValue.trim() === "") {
      return;
    }

    const updatedTask = {
      title: inputValue,
      completed: false,
    };

    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${editTaskId}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedTask),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      );
      const updatedTaskData = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editTaskId
            ? { ...task, title: updatedTaskData.title }
            : task
        )
      );
      setInputValue("");
      setEditTaskId(null);
      // Task updated successfully
    } catch (error) {
      console.log("Error updating task:", error);
    }
  };

  // Mark all tasks as completed
  const handleCompleteAll = () => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => ({ ...task, completed: true }))
    );
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.completed));
  };

  // Handle filter change
  const handleFilterChange = (filterType: SetStateAction<string>) => {
    setFilter(filterType);
  };

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") {
      return true;
    } else if (filter === "completed") {
      return task.completed;
    } else if (filter === "uncompleted") {
      return !task.completed;
    }
    return true;
  });

  // Display loading message while data is being fetched
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render the todo list
  return (
    <div className="container">
      <h1 className="title"> TODO APP </h1>
      <div className="todo-app">
        <div className="row">
          <i className="fas fa-list-check"></i>
          <input
            type="text"
            className="add-task"
            id="add"
            placeholder="Add your todo"
            autoFocus
            value={inputValue}
            onChange={handleInputChange}
          />
          <button
            id="btn"
            onClick={editTaskId ? handleUpdateTask : handleAddTask}
          >
            {editTaskId ? "Update" : "Add"}
          </button>
        </div>

        <div className="mid">
          <i className="fas fa-check-double"></i>
          <p id="complete-all" onClick={handleCompleteAll}>
            Complete all tasks
          </p>
          <p id="clear-all" onClick={handleClearCompleted}>
            Delete comp tasks
          </p>
        </div>

        <ul id="list">
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <input
                type="checkbox"
                id={`task-${task.id}`}
                data-id={task.id}
                className="custom-checkbox"
                checked={task.completed}
                onChange={() => handleTaskCheckboxChange(task.id)}
              />
              <label htmlFor={`task-${task.id}`}>{task.title}</label>
              <div>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/1159/1159633.png"
                  className="edit"
                  data-id={task.id}
                  onClick={() => handleEditTask(task.id)}
                />
                <img
                  src="https://cdn-icons-png.flaticon.com/128/3096/3096673.png"
                  className="delete"
                  data-id={task.id}
                  onClick={() => handleDeleteTask(task.id)}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="filters">
          <div className="dropdown">
            <button className="dropbtn">Filter</button>
            <div className="dropdown-content">
              <a href="#" id="all" onClick={() => handleFilterChange("all")}>
                All
              </a>
              <a
                href="#"
                id="rem"
                onClick={() => handleFilterChange("uncompleted")}
              >
                Uncompleted
              </a>
              <a
                href="#"
                id="com"
                onClick={() => handleFilterChange("completed")}
              >
                Completed
              </a>
            </div>
          </div>

          <div className="completed-task">
            <p>
              Completed:{" "}
              <span id="c-count">
                {tasks.filter((task) => task.completed).length}
              </span>
            </p>
          </div>
          <div className="remaining-task">
            <p>
              <span id="total-tasks">
                Total Tasks: <span id="tasks-counter">{tasks.length}</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoList;

import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import toast from "react-hot-toast";

const ListTasks = ({ tasks, setTasks }) => {
  const [backlog, setBacklog] = useState([]);
  const [todos, setTodos] = useState([]);
  const [inProgress, setInProgress] = useState([]);
  const [done, setDone] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      setTasks(fetchedTasks);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fBacklog = tasks ? tasks.filter((task) => task.status === "backlog") : [];
    const fTodos = tasks ? tasks.filter((task) => task.status === "todo") : [];
    const fInProgress = tasks ? tasks.filter((task) => task.status === "inprogress") : [];
    const fDone = tasks ? tasks.filter((task) => task.status === "done") : [];

    setBacklog(fBacklog);
    setTodos(fTodos);
    setInProgress(fInProgress);
    setDone(fDone);
  }, [tasks]);

  const handleAddTask = () => {
    const newTask = {
      id: tasks.length + 1,
      name: "New Task",
      status: "backlog",
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const statuses = ["Backlog", "Todo", "InProgress", "Done"];

  return (
    <div>
      <div className="flex gap-16">
        {statuses.map((status, index) => (
          <Section
            key={index}
            status={status}
            tasks={tasks}
            setTasks={setTasks}
            backlog={backlog}
            todos={todos}
            inProgress={inProgress}
            done={done}
          />
        ))}
      </div>
    </div>
  );
};

const Section = ({ status, tasks, setTasks, backlog, todos, inProgress, done }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item) => addItemToSection(item.id),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  let text = "Backlog";
  let bg = "bg-slate-500";
  let tasksToMap = backlog;

  if (status === "Todo") {
    text = "Todo";
    bg = "bg-purple-500";
    tasksToMap = todos;
  }
  if (status === "InProgress") {
    text = "InProgress";
    bg = "bg-green-500";
    tasksToMap = inProgress;
  }
  if (status === "Done") {
    text = "Done";
    bg = "bg-red-500";
    tasksToMap = done;
  }

  const addItemToSection = (id) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === id) {
          return { ...task, status: status.toLowerCase() };
        }
        return task;
      });

      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
      return updatedTasks;
    });

    toast("Task moved", { icon: "👌" });
  };

  return (
    <div ref={drop} className={`w-40 rounded-md p-2 ${isOver ? "bg-slate-200" : ""}`}>
      <Header text={text} bg={bg} count={tasksToMap.length} />
      {tasksToMap.length > 0 &&
        tasksToMap.map((task) => (
          <Task key={task.id} task={task} tasks={tasks} setTasks={setTasks} />
        ))}
    </div>
  );
};

const Header = ({ text, bg, count }) => {
  return (
    <div className={`${bg} flex items-center h-12 pl-4 rounded-md uppercase text-sm text-white`}>
      {text}
      <div className="bg-white w-5 h-5 text-black rounded-full flex items-center justify-center ml-2">
        {count}
      </div>
    </div>
  );
};

const Task = ({ task, tasks, setTasks }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleRemove = (id) => {
    const updatedTasks = tasks.filter((t) => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);

    toast("Task removed", { icon: "💀" });
  };

  return (
    <div
      ref={drag}
      className={`relative p-4 mt-8 shadow-md rounded-md cursor-grab ${
        isDragging ? "opacity-25" : "opacity-100"
      }`}
    >
      <p>{task.name}</p>
      <button className="absolute top-4 right-2" onClick={() => handleRemove(task.id)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
};

export default ListTasks;

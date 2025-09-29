import React, { useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

const API_BASE = process.env.REACT_APP_API_URL;

export function useTaskWebSocket(setTasks, url) {
  useWebSocket(url, (msg) => {
    switch (msg.type) {
      case "todo_update":
        setTasks(prev => {
          const exists = prev.find(t => t.id === msg.payload.id);
          return exists
            ? prev.map(t => t.id === msg.payload.id ? msg.payload : t)
            : [msg.payload, ...prev];
        });
        break;
      
      case "todo_deleted":
        setTasks(prev => prev.filter(t => t.id !== msg.payload.id));
        break;
      
      default:
    }
  });
}

export default function TaskList({ refreshKey }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks/`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get initial tasks
  useEffect(() => { fetchTasks(); }, [refreshKey]);

  useTaskWebSocket(setTasks, "wss://parking-system-backend-cctx.onrender.com/ws");
  // useTaskWebSocket(setTasks, "ws://localhost:8000/ws");

  const toggleDone = async (task) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done })
      });
      const updated = await res.json();
      setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/tasks/${id}/`, { method: "DELETE" });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">To Do List</h3>
      {loading ? <div>Loading...</div> : (
        <ul>
          {tasks.map(t => (
            <li key={t.id} className="border-b py-2 flex justify-between items-start">
              <div>
                <div className={t.done ? "line-through text-gray-500" : ""}>
                  {t.slot ? t.slot.car_number : `${t.slot_id}`} — Priority: {t.priority}
                </div>
                {t.memo && <div className="text-sm text-gray-600">{t.memo}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleDone(t)} className="px-2 py-1 border rounded">{t.done ? "Unfinish" : "Finish"}</button>
                <button onClick={() => deleteTask(t.id)} className="px-2 py-1 border rounded text-red-500">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

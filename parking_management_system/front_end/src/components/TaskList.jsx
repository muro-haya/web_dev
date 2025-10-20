import React, { useEffect, useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

const API_BASE = process.env.REACT_APP_API_URL;
const WS_URL = process.env.REACT_APP_WS_URL;
const STATUS_FLOW = ["NotYet", "OnIt", "Done"];
const LABEL_MAP = {
  NotYet: "Start",
  OnIt: "Complete",
  Done: "Reset"
};

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

  // useTaskWebSocket(setTasks, "wss://parking-system-backend-cctx.onrender.com/ws");
  // useTaskWebSocket(setTasks, "ws://localhost:8000/ws");
  useTaskWebSocket(setTasks, `${WS_URL}`);

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
  };

  const toggleStatus = async (task) => {
    try {
      const newStatus = nextStatus(task.status);
      const res = await fetch(`${API_BASE}/tasks/${task.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const updated = await res.json();
      setTasks(prevTasks => prevTasks.map(t => (t.id === updated.id ? updated : t)));
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
                <div
                  className={
                    t.status === "Done"
                      ? "line-through text-gray-500"
                      : t.status === "OnIt"
                      ? "text-blue-600"
                      : ""
                  }
                >
                  {t.slot ? t.slot.car_number : `${t.slot_id}`} — Priority: {t.priority}
                </div>
                {t.memo && <div className="text-sm text-gray-600">{t.memo}</div>}
              </div>
              <div className="flex gap-2">
                {/* console.log("task.status", t.status); */}
                <button
                  onClick={() => toggleStatus(t)}
                  className="px-2 py-1 border rounded"
                >
                  {LABEL_MAP[t.status] || "Reset"}
                  {LABEL_MAP[t.status]}
                </button>
                <button
                  onClick={() => deleteTask(t.id)} 
                  className="px-2 py-1 border rounded text-red-500"
                  >
                    Delete
                  </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

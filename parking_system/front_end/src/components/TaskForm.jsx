import React, { useState } from "react";
const API_BASE = process.env.REACT_APP_API_URL;

export default function TaskForm({ slot, onAdded, onCancel }) {
  const [priority, setPriority] = useState("medium");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_id: slot.car_number, priority, memo })
      });
      if (!res.ok) throw new Error("create failed");
      const data = await res.json();
      onAdded(data);
    } catch (err) {
      console.error(err);
      alert("Fault");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 p-3 border rounded bg-gray-50">
      <div className="font-bold mb-2">{slot.car_number} Add a task</div>
      <div className="mb-2">
        <label className="mr-2">Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="border p-1 rounded">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Memo" className="w-full border p-2 rounded mb-2" />
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="px-3 py-1 bg-blue-500 text-white rounded">Add</button>
        <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
}

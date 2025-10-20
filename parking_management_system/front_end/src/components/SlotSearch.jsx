import React, { useState, useEffect, useRef } from "react";
const API_BASE = process.env.REACT_APP_API_URL;

export default function SlotSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const id = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/search/?q=${encodeURIComponent(query)}&limit=10`, { signal: controller.signal });
        if (!res.ok) throw new Error("search failed");
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }, 250); // debounce 250ms

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="relative w-80">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setOpen(true)}
        placeholder="Searching..."
        className="w-full border p-2 rounded"
      />
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded mt-1 z-50 max-h-48 overflow-auto">
          {results.map((s) => (
            <li
              key={s.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => { onSelect(s); setQuery(""); setResults([]); setOpen(false); }}
            >
              {s.name} {s.car_number ? `${s.car_number}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

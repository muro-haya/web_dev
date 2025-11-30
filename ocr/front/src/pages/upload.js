import React, { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);   // Holds the actual selected file
  const [preview, setPreview] = useState(null);             // Local preview URL for showing the chosen image
  const [detections, setDetections] = useState([]);         // List of detected plate results returned from backend

  // Send selected image to backend for analysis
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);                  // Attach image file

    try {
      // POST request to FastAPI backend
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();

      // Save detection results (or empty list if nothing returned)
      setDetections(data.detections || []);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="flex flex-col items-center p-10">
      <h1 className="text-2xl font-bold mb-4">License Plate Detector</h1>
      <div className="mt-4">
        <label
          className="flex items-center justify-center w-64 h-12 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-100"
        >
          {selectedFile ? selectedFile.name : "Select a file"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setSelectedFile(file);
              setPreview(URL.createObjectURL(file));
            }}
            className="hidden"
          />
        </label>
      </div>

      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="preview"
            className="max-w-md rounded-lg shadow-md"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Analyze
      </button>

      {detections.length > 0 && (
        <div className="mt-6 text-left">
          <h2 className="text-xl font-semibold mb-2">Detected Plates:</h2>
          <ul className="list-disc pl-6">
            {detections.map((det, idx) => (
              <li key={idx}>
                {det.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

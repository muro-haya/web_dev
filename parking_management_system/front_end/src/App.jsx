import React, { useState } from 'react';
import ParkingMap from './components/ParkingMap';
import SlotSearch from "./components/SlotSearch";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

function App() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdded = (task) => {
    setSelectedSlot(null);
    setRefreshKey(k => k + 1); // TaskList の再読み込みをトリガー
  };

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      <h1 className='text-2x1 font-bold mb-4'>Parking Management System</h1>
      <ParkingMap />

      <SlotSearch onSelect={setSelectedSlot} />
      {selectedSlot && 
        <TaskForm slot={selectedSlot} onAdded={handleAdded} onCancel={() => setSelectedSlot(null)} />}

      <TaskList refreshKey={refreshKey} />
    </div>
  );
}

export default App;


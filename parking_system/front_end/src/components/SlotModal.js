import React, { useState } from "react";

export default function SlotModal({ slot, onClose, onSave  }) {
    const [carNumber, setCarNumber] = useState(slot.car_number || "");

    const handleSave = async () => {
        await onSave(slot.id, carNumber);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex item-center justify-center">
            <div className="bg-white p-4 rounded-lg">
                <h2>Parking Space {slot.number}</h2>
                <input
                    type="text"
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    className="border p-2 w-full"
                    placeholder="Number"
                />
                <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={onClose}
                      className="ml-2 bg-gray-300 px-4 py-2 rounded"
                    >
                      Close
                    </button>
                </div>
            </div>
        </div>
    );
}
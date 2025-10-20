import React, { useState } from "react";
import { createPortal } from "react-dom";

export default function SlotModal({ slot, onClose, onSave }) {
    const [carNumber, setCarNumber] = useState(slot.car_number || "");

    const handleSave = async () => {
        await onSave(slot.id, carNumber);
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-5 rounded-lg w-72 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold">Parking Space {slot.number}</h2>
                <input
                    type="text"
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="Number"
                    className="w-full p-2 rounded-md border border-gray-300 mb-4 bg-white"
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-600"
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

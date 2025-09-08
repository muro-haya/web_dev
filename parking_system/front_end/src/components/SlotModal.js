import React, { useState } from "react";
import { createPortal } from "react-dom";

export default function SlotModal({ slot, onClose, onSave }) {
    const [carNumber, setCarNumber] = useState(slot.car_number || "");

    const handleSave = async () => {
        await onSave(slot.id, carNumber);
        onClose();
    };

    const modalContent = (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                width: "300px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
            }}>
                <h2 style={{ marginBottom: "15px" }}>Parking Space {slot.number}</h2>
                <input
                    type="text"
                    value={carNumber}
                    onChange={(e) => setCarNumber(e.target.value)}
                    placeholder="Number"
                    style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        marginBottom: "15px",
                        backgroundColor: "white"
                    }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={handleSave}
                        style={{
                            backgroundColor: "#3b82f6",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            border: "none",
                            cursor: "pointer",
                            marginRight: "10px"
                        }}
                    >
                        Save
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            backgroundColor: "#e5e7eb",
                            color: "#111",
                            padding: "8px 16px",
                            borderRadius: "5px",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

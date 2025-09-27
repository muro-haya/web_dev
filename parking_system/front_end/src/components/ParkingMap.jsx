import React, { useState, useRef} from 'react';
import { updateSlot } from "../api";
import { useSlotLayout } from "../hooks/useSlotLayout";
import { useWebSocket } from "../hooks/useWebSocket";
import { ReactComponent as ParkingSVG } from "../assets/parkingMap_v2.svg"
import SlotModal from "./SlotModal";

export function useSlotWebSocket(setSlots, url) {
  useWebSocket(url, (msg) => {
    switch (msg.type) {
        case "slot_update":
            setSlots(prev =>
                prev.map(s =>
                    s.id === msg.payload.id ? { ...s, ...msg.payload } : s
                )
            );
            break;
        default:
    }   
  });
}

export default function ParkingMap(){
    const svgRef = useRef(null);
    const [slots, setSlots] = useSlotLayout(svgRef);
    const [selected, setSelected] = useState(null);

    // useSlotWebSocket(setSlots, "wss://parking-system-backend-cctx.onrender.com/ws");
    useSlotWebSocket(setSlots, "ws://localhost:8000/ws");

    const handleClick = async (slot) => {
        let becameOccupied = false;
        const updatedSlots = slots.map((s) => {
          if (s.id === slot.id) {
            const newStatus = s.status === "empty" ? "occupied" : "empty";
            if (s.status === "empty" && newStatus === "occupied") {
              becameOccupied = true;
            }
            else if (s.status === "occupied" && newStatus === "empty") {
                    s.car_number = "";
            }
            return { 
                ...s,
                status: newStatus,
            };
          }
          return s;
        });
      
        setSlots(updatedSlots);

        try {
            const newSlot = updatedSlots.find(s => s.id === slot.id);
            await updateSlot(slot.id, newSlot.car_number); // car_number が "" の場合 empty に
        } catch (err) {
            console.error("Failed to update slot:", err);
        }
        setSelected(becameOccupied ? slot : null);
    };

    const handleSave = async (id, carNumber) => {
        await updateSlot(id, carNumber);

        setSlots((prev) =>
            prev.map((s) =>
                s.id === id
                    ? { ...s, car_number: carNumber, status: "occupied" }
                    : s
            )
        );
        setSelected(null);
    };

    return (
        <>
        <div className="relative w-full max-w-4xl mx-auto">
            <ParkingSVG 
                ref={svgRef}
                className="w-full h-auto"
            />
            {slots.map((slot) => (
                <div
                    key={slot.id}
                    onClick={() => handleClick(slot)}
                    className='absolute cursor-pointer flex items-center justify-center'
                    style={{
                        position: "absolute",
                        top: slot.y,
                        left: slot.x,
                        width: slot.width,
                        height: slot.height,
                        border: "2px solid blue",
                        backgroundColor: slot.status ===
                         "occupied" ? "rgba(255,0,0,0.5)" : "rgba(0,255,0,0.3)",
                        
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {slot.car_number && 
                        <span 
                            style={{
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "0.9rem"
                            }}
                        >
                            {slot.car_number}
                        </span>}
                </div>
            ))}
        </div>
        {selected && (
                <SlotModal
                    slot={selected}
                    onClose={() => setSelected(null)}
                    onSave={handleSave}
                />
        )}
        </>
    );
}

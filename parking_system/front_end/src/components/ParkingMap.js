import React, { useState, useEffect, useRef} from 'react';
import { getSlots, updateSlot } from "../api";
import { ReactComponent as ParkingSVG } from "../assets/parkingMap.svg"
import SlotModal from "./SlotModal";


export default function ParkingMap(){
    const [slots, setSlots ] = useState([]);
    const [selected, setSelected] = useState(null);
    const svgRef = useRef(null);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!svgRef.current) return;

            // SVG上の座標情報を取得
            const slotElements = svgRef.current.querySelectorAll("[id^=slot-]");
            const slotPositions = Array.from(slotElements).map((el) => {
                const bbox = el.getBBox();
                return {
                    id: parseInt(el.id.replace("slot-", ""), 10),
                    number: el.id.replace("slot-", ""),
                    x: bbox.x,
                    y: bbox.y,
                    width: bbox.width,
                    height: bbox.height,
                };
            });

            // バックエンドから現在の状態を取得
            const backendSlots = await getSlots(); // {id, car_number, status} の配列

            // SVG情報とバックエンドの状態をマージ
            const merged = slotPositions.map(pos => {
                const backend = backendSlots.find(b => b.id === pos.id);
                return {
                    ...pos,
                    status: backend?.status || "empty",
                    car_number: backend?.car_number || "",
                };
            });

            setSlots(merged);
        };

        fetchSlots();
    }, []);


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

        const newSlot = updatedSlots.find(s => s.id === slot.id);
        try {
            await updateSlot(slot.id, newSlot.car_number); // car_number が "" の場合 empty に
        } catch (err) {
            console.error("Failed to update slot:", err);
        }
        setSelected(becameOccupied ? slot : null);
    };

    const handleSave = async (slotId, carNumber) => {
        await updateSlot(slotId, carNumber);

        setSlots((prev) =>
            prev.map((s) =>
                s.id === slotId
                    ? { ...s, car_number: carNumber, status: "occupied" }
                    : s
            )
        );

        setSelected(null);
    };

    return (
        <div className="relative w-full max-w-4x1 mx-auto" style={{ height: 600 }}>
            <ParkingSVG 
                ref={svgRef}
                className="w-full h-auto"
            />
            {slots.map((slot) => (
                <div key={slot.id}
                    onClick={() => handleClick(slot)}
                    className='absolute cursor-pointer flex items-center justify-center'
                    style={{
                        position: "absolute",
                        top: slot.y + 25,
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
            {selected && (
                <SlotModal
                    slot={selected}
                    onClose={() => setSelected(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

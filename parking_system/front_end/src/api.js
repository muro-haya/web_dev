const API_URL = process.env.REACT_APP_API_URL;

export async function getSlots() {
    const res = await fetch(`${API_URL}/slots/`);
    if (!res.ok){
        throw new Error("Network response was not ok");
    } 
    return res.json();
}

export async function updateSlot(slotId, carNumber) {
    const res = await fetch(`${API_URL}/slots/${slotId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ car_number: carNumber }),
    });
    if (!res.ok){
        throw new Error("Network response was not ok");
    }
    return res.json();
}
